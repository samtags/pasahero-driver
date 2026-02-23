import { View, StyleSheet, BackHandler } from "react-native";
import db from "@/src/services/firebase/db";
import { handleGetRoomData } from "@/src/services/hooks/useDial";
import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import Text from "@/src/components/text";
import Optional from "@/src/components/optional";
import Drop from "./components/drop";
import Pickup from "./components/pickup";
import router, { useRouterParams } from "@/src/services/router";

export default function Ring() {
  const params = useRouterParams();

  const roomId = params?.roomId;
  const sessionId = params?.sessionId;

  /*** @type {["CONNECTING" | "RINGING" | "TIMEOUT" | "CONNECTED" | "TERMINATED" | "DECLINED" | "DISCONNECTED"]} */
  const [state, setState] = useState("RINGING");

  useEffect(() => {
    if (roomId) {
      const unsubscribe = db
        .collection("rooms")
        .doc(roomId)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (sessionId === data?.sessionId) {
              setState(data.status);
            }
          }
        });

      return () => unsubscribe?.();
    }
  }, []);

  useEffect(() => {
    switch (state) {
      case "DISCONNECTED":
      case "TERMINATED":
      case "TIMEOUT":
      case "DECLINED":
        setTimeout(router.back, 1500);
        break;

      default:
        break;
    }
  }, [state]);

  useEffect(() => {
    const handleBackPress = () => true;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );

    return () => subscription.remove();
    // BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
  }, []);

  const handleAccept = () => {
    router.replace({
      pathname: "/answer",
      params: {
        roomId,
      },
    });
  };

  const handleReject = async () => {
    const room = await handleGetRoomData(roomId);

    if (room.sessionId === sessionId) {
      await db.collection("rooms").doc(roomId).update({ status: "DECLINED" });
    }

    setTimeout(router.back, 1500);
  };

  const isRejected = ["DECLINED", "TIMEOUT", "TERMINATED", "DISCONNECTED"].includes(state); // prettier-ignore

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <LinearGradient
        style={styles.container}
        colors={["#65666A", "#292D33"]}
        end={{ x: 1, y: 1 }}
      >
        <View
          style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
        >
          <Optional condition={isRejected === false}>
            <Text size={21} color="white">
              Your passenger is calling
            </Text>
          </Optional>
          <Optional condition={isRejected === true}>
            <Text size={21} color="white">
              Call Ended
            </Text>
          </Optional>
        </View>
        <View style={styles.actionContainer}>
          <Drop label="Decline" onPress={handleReject} />

          <Pickup label="Answer" onPress={handleAccept} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 32,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 36,
  },
});
