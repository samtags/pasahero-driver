import { useState, useEffect, useRef } from "react";
import {
  RTCPeerConnection,
  mediaDevices,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";
import InCallManager from "react-native-incall-manager";
import db from "@/src/services/firebase/db";
import {
  handleClearRoom,
  handleGetRoomData,
  handleUpdateRoomStatus,
} from "./useDial";
import { Alert, Linking } from "react-native";
import log from "@/src/services/log";
import router from "@/src/services/router";

export default function useJoin(roomId) {
  const peerConnectionRef = useRef(null);
  const sessionIdRef = useRef();
  const [userStream, setUserStream] = useState();
  const [streams, setStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const statusState = useState("CONNECTING");
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  /*** @type {["CONNECTING" | "RINGING" | "TIMEOUT" | "CONNECTED" | "TERMINATED" | "DECLINED" | "DISCONNECTED"]} */
  const [state, setState] = useState("CONNECTING");

  /** @deprecated use state instead */
  const status = statusState[0];
  const setStatus = statusState[1];

  useEffect(() => {
    log.debug(`Subscribing to the room updates of room: ${roomId}`, roomId);
    const unsubscribe = db
      .collection("rooms")
      .doc(roomId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (sessionIdRef.current === data?.sessionId) {
            setState(data.status);
          }
        }
      });

    return () => {
      unsubscribe?.();
    };
  }, []);
  useEffect(() => {
    const subscriptions = [];

    (async () => {
      const userStream = await mediaDevices
        .getUserMedia({
          audio: true,
        })
        .catch(() => {
          handleHangup();
          Alert.alert("Permission required", "Please allow microphone access", [
            {
              text: "OK",
              onPress: () => {
                // redirect to the settings page
                Linking.openSettings();
                router.back();
              },
            },
          ]);
        });

      setUserStream(userStream);

      const roomRef = await db.collection("rooms").doc(roomId);
      const calleeCandidatesCollection = roomRef.collection("calleeCandidates");
      const roomSnapshot = await roomRef.get();

      sessionIdRef.current = roomSnapshot?.data?.()?.sessionId;

      const peerConnection = new RTCPeerConnection(configuration);

      // Add each track from the localStream to the RTCPeerConnection
      userStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, userStream);
      });

      // events
      peerConnection.onicecandidate = (e) => {
        if (!e.candidate) return;
        calleeCandidatesCollection.add(e.candidate.toJSON());
      };

      peerConnection.oniceconnectionstatechange = (e) => {
        if (peerConnection.iceConnectionState == "disconnected") {
          handleDisconnection();
        }

        if (peerConnection?.iceConnectionState == "connected") {
          // other party is connected
          setStatus("CONNECTED");
        }
      };

      peerConnection.ontrack = (e) => {
        if (e?.streams) setStreams(e?.streams);
      };

      const offer = roomSnapshot.data().offer;
      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer)); // prettier-ignore

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      await roomRef.update({ answer });

      subscriptions.push(
        roomRef.collection("callerCandidates").onSnapshot((snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              let data = change.doc.data();
              await peerConnection.addIceCandidate(new RTCIceCandidate(data));
            }
          });
        })
      );

      peerConnectionRef.current = peerConnection;
    })();

    return () => {
      subscriptions.forEach((subscription) => subscription());
    };
  }, []);

  // stream clean up
  useEffect(() => {
    if (streams.length) {
      return () => {
        streams?.forEach((stream) => {
          stream.getTracks().forEach((track) => track.stop());
        });
      };
    }
  }, [streams]);

  function handleToggleMute() {
    userStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  }

  function handleCloseMedia() {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.getTransceivers().forEach((transceiver) => {
        transceiver.stop();
      });
      peerConnectionRef.current.close();
    }
  }

  async function handleHangUp() {
    const room = await handleGetRoomData(roomId);

    if (room) {
      if (room.sessionId === sessionIdRef.current) {
        handleClearRoom(roomId);
      }
    }

    handleCloseMedia();
    setStatus("DROPPED");
  }

  function handleToggleSpeaker() {
    if (isSpeakerOn) {
      // Turn off loudspeaker
      InCallManager.setSpeakerphoneOn(false);
    } else {
      // Turn on loudspeaker
      InCallManager.setSpeakerphoneOn(true);
    }
    setIsSpeakerOn(!isSpeakerOn);
  }

  async function handleTerminate() {
    log.debug("Call terminated", { roomId });
    handleUpdateRoomStatus(roomId, "TERMINATED");
    handleCloseMedia();
  }

  async function handleDisconnection() {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // prevent conflicting statuses sometimes disconnection fire before the terminal statuses

    handleUpdateRoomStatus(roomId, "DISCONNECTED");
    handleCloseMedia();
  }

  function handleCleanup() {
    handleCloseMedia();
  }

  return {
    peerConnectionRef,
    userStream,
    streams,
    isMuted,
    handleToggleMute,
    handleHangUp,
    /** @deprecated use state instead */
    status,
    isSpeakerOn,
    handleToggleSpeaker,
    handleTerminate,
    state,
    handleCleanup,
  };
}

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};
