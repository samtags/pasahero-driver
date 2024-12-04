import { useState, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Text from "../../components/text";
import Cta from "../../components/cta";
import { useRouter, useSegments } from "expo-router";
import log from "../log";
import supabase from "../supabase";
import storage from "../storage";
import useGetDriverProfile from "../queries/useGetDriverProfile";
import { Image } from "expo-image";
import Optional from "../../components/optional";
import getColorByPlatform from "../util/colors/getColorByPlatform";

export default function Provider() {
  const router = useRouter();
  const segments = useSegments();

  const [incoming, setIncoming] = useState();
  const { data: profile } = useGetDriverProfile(incoming?.driver_profile_id);

  useIncomingMessage((data) => setIncoming(data));

  function handleClose() {
    setIncoming();
  }

  function handleReply() {
    router.navigate({
      pathname: `/messaging/${incoming?.transit}`,
      params: {
        match_id: incoming?.transit,
        driver_id: incoming?.sender_id,
        transit: incoming?.transit,
      },
    });

    setIncoming();
  }

  const isAlreadyInMessageScreen = segments.includes("messaging");

  // if user is not in message screen upon receiving incoming message
  if (isAlreadyInMessageScreen) return null;

  if (Boolean(incoming?.message) === false) return null;

  // show the message prompt
  log.debug("Showing incoming message prompt.", { profile });

  return (
    <View style={styles.promptContainer}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.image}>
            <Optional condition={Boolean(profile?.image_url)}>
              <Image
                style={{ width: "100%", height: "100%" }}
                cachePolicy="memory-disk"
                source={profile?.image_url}
              />
            </Optional>
          </View>
          <View>
            <Text weight="700" size={18} color="#363F59">
              {`${profile?.first_name ?? ""} ${
                profile?.last_name ?? ""
              }`.trim()}
            </Text>
            <Text
              weight="700"
              size={14}
              color={getColorByPlatform(profile?.platform)}
            >
              {profile?.platform}
            </Text>
          </View>
        </View>
        <View style={{ padding: 16 }}>
          <View
            style={{
              backgroundColor: "#F0F0F0",
              padding: 16,
              borderRadius: 10,
            }}
          >
            <Text color="#707070">{incoming?.message}</Text>
          </View>

          <View style={{ marginTop: 32 }} />

          <Cta onPress={handleClose} color="transparent" textColor="#D1D5DB">
            Close
          </Cta>

          <Cta
            onPress={handleReply}
            color={getColorByPlatform(profile?.platform)}
          >
            Reply
          </Cta>
        </View>
      </View>
    </View>
  );
}

function useIncomingMessage(callback) {
  const segments = useSegments();
  const isAlreadyInMessageScreen = segments.includes("messaging");

  useEffect(() => {
    // only subscribe to the channel if user is not in message screen
    let channel;

    if (isAlreadyInMessageScreen === false) {
      const userId = storage.getString("user.id");

      channel = supabase
        .channel("msg.incoming")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "msg",
            filter: `receiver_id=eq.${userId}`,
          },
          (payload) => {
            log.debug("Incoming message", payload.new);
            callback(payload?.new);
          }
        )
        .subscribe();

      log.debug("Subscribed to incoming messages", {
        userId,
        channel: "msg.incoming",
      });
    }
    return () => {
      channel?.unsubscribe?.();
      log.debug("Unsubscribed from incoming messages");
    };
  }, [isAlreadyInMessageScreen]);
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderColor: "#EAEAEA",
    borderBottomWidth: 1,
  },
  image: {
    width: 55,
    height: 55,
    backgroundColor: "#f3f4f6",
    borderRadius: 9,
    overflow: "hidden",
  },
  promptContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    position: "absolute",
    justifyContent: "flex-end",
    backgroundColor: "#00000032",
  },
  content: {
    backgroundColor: "white",
  },
});
