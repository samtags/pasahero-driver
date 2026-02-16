import { useState, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Text from "../../components/text";
import Cta from "../../components/cta";
import { useRouter, useSegments } from "expo-router";
import log from "@/src/services/log";
import supabase from "../supabase";
import storage from "../storage";
import { TransitPoints } from "../../screens/match/[id]";
import findNearby from "../api/findNearby";
import { useMutation } from "@tanstack/react-query";
import { useMMKVString } from "react-native-mmkv";

export default function RequestTimeout() {
  const router = useRouter();
  const segments = useSegments();
  const isInMatchScreen = segments.join("/") === "match/[id]";

  const [incoming, setIncoming] = useState();
  useRequestTimeoutTripListener((data) => setIncoming(data));

  function handleClosePrompt() {
    setIncoming();
    log.debug("Request timeout prompt closed.");
  }

  const { isPending, mutateAsync: handleRequestTrip } = useMutation({
    onSuccess,
    onError,
    mutationFn,
  });

  function onSuccess(data) {
    log.debug("Recreated trip from request timeout", { data });
    router.navigate({ pathname: `match/${data?.id}` });
    setTimeout(handleClosePrompt, 500);
  }

  function onError() {
    log.warn("Unable to recreate trip from request timeout", { incoming });
  }

  function mutationFn() {
    return findNearby({
      user_id: storage.getString("user.id"),
      first_point: incoming?.first_point,
      last_point: incoming?.last_point,
      services: incoming?.services,
      estimatePreview: incoming?.estimatePreview,
    });
  }

  // if user is not in message screen upon receiving incoming message
  if (isInMatchScreen) return null;
  if (Boolean(incoming) === false) return null;

  // show the message prompt
  log.debug("Showing trip timeout prompt.", { incoming });

  return (
    <View style={styles.promptContainer}>
      <View style={styles.content}>
        <View style={{ gap: 16 }}>
          <Text size={28} weight="700" color="#353579">
            No drivers nearby
          </Text>

          <Text size={14} color="#707070">
            It seems there are no available drivers nearby in your area. Do you
            want to continue searching?
          </Text>
        </View>

        <TransitPoints
          first_point={incoming?.first_point}
          last_point={incoming?.last_point}
        />

        <Cta
          disabled={isPending}
          onPress={handleClosePrompt}
          color="transparent"
          textColor="#353579"
        >
          No. Thank you
        </Cta>

        <Cta
          disabled={isPending}
          onPress={handleRequestTrip}
          color={isPending ? "#B9BAF9" : "#6366F1"}
        >
          Continue
        </Cta>
      </View>
    </View>
  );
}

function useRequestTimeoutTripListener(callback) {
  const [userId] = useMMKVString("user.id");
  const segments = useSegments();
  const isInMatchScreen = segments.join("/") === "match/[id]";

  useEffect(() => {
    let channel;

    if (userId) {
      if (isInMatchScreen === false) {
        channel = supabase
          .channel("matches.request_timeout")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "matches",
              filter: `passenger_id=eq.${userId}`,
            },
            (payload) => {
              const data = payload?.new;
              if (data?.status === "REQUEST_TIMEOUT") {
                log.debug("Received request timeout match event", data);
                callback(data);
              }
            },
          )
          .subscribe();

        log.debug("Subscribed to request timeout match event", {
          userId,
          channel: "matches.request_timeout",
          filter: `passenger_id=eq.${userId}`,
          table: "matches",
          schema: "public",
        });
      }
    }
    return () => {
      channel?.unsubscribe?.();
      log.debug("Unsubscribed from request timeout match event");
    };
  }, [isInMatchScreen, userId]);
}

const styles = StyleSheet.create({
  promptContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    position: "absolute",
    justifyContent: "flex-end",
    backgroundColor: "#00000032",
  },
  content: {
    backgroundColor: "white",
    padding: 16,
    paddingTop: 32,
  },
});
