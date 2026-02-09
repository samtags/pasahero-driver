import { useState, useEffect, useRef } from "react";

import {
  RTCPeerConnection,
  mediaDevices,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";
import db from "@/src/services/firebase/db";
import InCallManager from "react-native-incall-manager";
import uuidv4 from "@/src/services/util/uuidv4";
import moment from "moment";
import { Alert, Linking } from "react-native";
import log from "@/src/services/log";
import { useFeatureValue } from "@growthbook/growthbook-react";
import router from "@/src/services/router";
import axios from "axios";

export default function useDial(roomId) {
  const timeoutRef = useRef();
  const peerConnectionRef = useRef(null);
  const sessionIdRef = useRef(null);
  const [sessionId, setSessionId] = useState("");
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

  const callAcknowledgmentTimeoutInSeconds = useFeatureValue("call-acknowledgment-timeout-in-seconds", 60); // prettier-ignore

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
    log.debug("Setting call acknowledgment timeout.", { roomId, callAcknowledgmentTimeoutInSeconds }); // prettier-ignore
    timeoutRef.current = setTimeout(async () => {
      await handleUpdateRoomStatus(roomId, "TIMEOUT");

      log.debug("Call acknowledgment timeout reached. Status updated to TIMEOUT", { roomId }); // prettier-ignore
    }, 1000 * callAcknowledgmentTimeoutInSeconds);

    const subscriptions = [];
    const pendingPeerCandidates = [];
    let remoteDescriptionReady = false;

    (async () => {
      const status = await handleCheckReceiverCallStatus();

      if (status === "BUSY") {
        setStatus("BUSY");
        return;
      }

      const { sessionId } = await handleCreateRoom(roomId);
      sessionIdRef.current = sessionId;
      setSessionId(sessionId);

      const roomRef = await db.collection("rooms").doc(roomId);
      const callerCandidatesCollection = roomRef.collection("callerCandidates");

      // create stream
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

      setStatus("RINGING");

      const peerConnection = new RTCPeerConnection(configuration);

      userStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, userStream);
      });

      peerConnection.onicecandidate = (e) => {
        if (!e?.candidate) return;
        callerCandidatesCollection.add(e.candidate.toJSON());
      };

      peerConnection.oniceconnectionstatechange = (e) => {
        if (peerConnection?.iceConnectionState == "disconnected") {
          // Alert.alert("Call ended", "Call receiver ended the call.");
          handleDisconnection();
        }

        if (peerConnection?.iceConnectionState == "connected") {
          // other party is connected
          // Alert.alert("Answered", "Call receiver answered your call!");
          setStatus("CONNECTED");
          handleConnected();
        }
      };

      peerConnection.ontrack = (e) => {
        if (e?.streams) setStreams(e?.streams);
      };

      // make sure all media are attached before creating a offer
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      const roomWithOffer = { offer };
      await roomRef.update(roomWithOffer);
      sendNotification(roomId);

      subscriptions.push(
        roomRef.onSnapshot(async (snapshot) => {
          const data = snapshot.data();
          if (!peerConnection.currentRemoteDescription && data?.answer) {
            const rtcSessionDescription = new RTCSessionDescription(
              data?.answer,
            );
            await peerConnection.setRemoteDescription(rtcSessionDescription);
            remoteDescriptionReady = true;

            // add the candidates when desciption is ready.
            if (pendingPeerCandidates.length) {
              pendingPeerCandidates.forEach((candidate) => {
                peerConnection.addIceCandidate(candidate);
              });
            }
          }

          if (data?.rejected) {
            handleCallRejected();
          }
        }),
      );

      subscriptions.push(
        roomRef.collection("calleeCandidates").onSnapshot((snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "added") {
              let data = change.doc.data();

              // wait for the candidate description
              if (remoteDescriptionReady) {
                peerConnection.addIceCandidate(new RTCIceCandidate(data));
              } else {
                pendingPeerCandidates.push(new RTCIceCandidate(data));
              }
            }
          });
        }),
      );

      peerConnectionRef.current = peerConnection;
      setUserStream(userStream);
    })();

    return () => {
      // close the rtc connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.getTransceivers().forEach((transceiver) => {
          transceiver.stop();
        });
        peerConnectionRef.current.close();
      }

      // handle close media
      streams?.forEach((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      });

      // handle unsubscribe to snapshot listeners
      subscriptions.forEach((unsubscribe) => unsubscribe());
    };
    // return handleCleanUp;
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
    if (peerConnectionRef?.current) {
      peerConnectionRef?.current?.getTransceivers?.()?.forEach?.((transceiver) => { 
        transceiver?.stop?.();
      }); // prettier-ignore
      peerConnectionRef?.current?.close?.();
    }
  }

  async function handleHangup() {
    log.debug("Hanging up the call", { roomId, sessionId });
    const room = await handleGetRoomData(roomId);

    if (room) {
      if (room.sessionId === sessionId) {
        handleClearRoom(roomId);
      }
    }

    // handleCloseMedia();
    setStatus("DROPPED");
  }

  function handleCallRejected() {
    handleClearRoom(roomId);

    // handleCloseMedia();
    setStatus("REJECTED");
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

  async function handleConnected() {
    clearTimeout(timeoutRef?.current);

    log.debug("Call connected", { roomId, sessionId });

    const roomRef = db.collection("rooms").doc(roomId);
    await roomRef.update({ status: "CONNECTED" });
  }

  async function handleTerminate() {
    clearTimeout(timeoutRef.current);

    log.debug("Call terminated", { roomId, sessionId });

    await handleUpdateRoomStatus(roomId, "TERMINATED");
    handleCloseMedia();
  }

  async function handleDisconnection() {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // prevent conflicting statuses sometimes disconnection fire before the terminal statuses
    await handleUpdateRoomStatus(roomId, "DISCONNECTED");
    handleCloseMedia();
  }

  function handleCleanup() {
    handleCloseMedia();
  }

  return {
    userStream,
    streams,
    isMuted,
    peerConnectionRef,
    /** @deprecated use state instead */
    status,
    handleToggleMute,
    handleHangup,
    isSpeakerOn,
    handleToggleSpeaker,
    sessionId,
    handleTerminate,
    state,
    handleCleanup,
  };
}

export async function handleGetRoomData(roomId) {
  try {
    const doc = await db.collection("rooms").doc(roomId).get();
    if (doc?.exists) return doc.data();
  } catch (err) {
    return undefined;
  }
}

/**
 * @param {string} roomId
 * @returns {"OK" | "BUSY"}
 */
async function handleCheckReceiverCallStatus(roomId) {
  const room = await handleGetRoomData(roomId);

  if (room) {
    if (Date.now() > room.validTill) return "BUSY";
    await handleClearRoom(roomId);
  }

  return "OK";
}

/**
 *
 * @param {string} userId
 */
export async function handleClearRoom(userId) {
  await db.collection("rooms").doc(userId).delete();
}

/**
 * @param {string} roomId
 */
async function handleCreateRoom(roomId) {
  const sessionId = uuidv4();
  const validTill = moment().add(15, "minutes").valueOf();

  await db.collection("rooms").doc(roomId).set({
    sessionId,
    validTill,
    showed: false,
    status: "CONNECTING",
  });

  return {
    sessionId,
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

export async function handleUpdateRoomStatus(roomId, status) {
  const roomRef = db.collection("rooms").doc(roomId);
  const room = await handleGetRoomData(roomId);

  const terminalStatuses = ["TIMEOUT", "TERMINATED", "DISCONNECTED", "DECLINED"]; // prettier-ignore

  if (!terminalStatuses.includes(room.status)) {
    await roomRef.update({ status });
  }
}

function sendNotification(id) {
  console.debug("Sending notification to the passenger", { id });
  axios.get(`https://driver-93954675246.asia-southeast1.run.app/call?id=${id}`);
}
