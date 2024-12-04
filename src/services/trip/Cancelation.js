import { useState, useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Text from "../../components/text";
import Cta from "../../components/cta";
import { useRouter, useSegments } from "expo-router";
import log from "../log";
import supabase from "../supabase";
import storage from "../storage";
import { TransitPoints } from "../../screens/match/[id]";
import findNearby from "../api/findNearby";
import { useMutation } from "@tanstack/react-query";
import { useMMKVString } from "react-native-mmkv";
import { invalidateUseMatches } from "../queries/useMatches";
import rebook from "../api/rebook";

export default function Cancelation() {
  const router = useRouter();
  const segments = useSegments();
  const isInMatchScreen = segments.join("/") === "match/[id]";

  const [incoming, setIncoming] = useState();
  useCancelTripListener((data) => setIncoming(data));

  function handleClosePrompt() {
    setIncoming();
    log.debug("Trip cancelation prompt closed.");
    invalidateUseMatches();
  }

  const { isPending, mutateAsync: handleRequestTrip } = useMutation({
    onSuccess,
    onError,
    mutationFn,
  });

  function onSuccess(data) {
    log.debug("Recreated trip from cancelation", { data });
    router.navigate({ pathname: `match/${data?.id}` });
    setTimeout(handleClosePrompt, 500);
  }

  function onError() {
    log.warn("Unable to recreate trip from cancelation", { incoming });
  }

  function mutationFn() {
    return rebook(incoming.id);
  }

  // if user is not in message screen upon receiving incoming message
  if (isInMatchScreen) return null;
  if (Boolean(incoming) === false) return null;

  // show the message prompt
  log.debug("Showing trip canceled prompt.", { incoming });

  return (
    <View style={styles.promptContainer}>
      <View style={styles.content}>
        <View style={{ gap: 16 }}>
          <Text size={28} weight="700" color="#353579">
            Oh no!
          </Text>

          <Text weight="700" size={18} color="#1B1B1B">
            Driver canceled
          </Text>

          <Text size={14} color="#707070">
            We&apos;re sorry. While you are away, the driver requested to cancel
            the trip.{" "}
          </Text>

          <Text weight="700" size={14} color="#707070">
            Do you want to continue this trip request?
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

function useCancelTripListener(callback) {
  const [userId] = useMMKVString("user.id");
  const segments = useSegments();
  const isInMatchScreen = segments.join("/") === "match/[id]";

  useEffect(() => {
    let channel;

    if (userId) {
      if (isInMatchScreen === false) {
        channel = supabase
          .channel("matches.canceled")
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
              log.debug("Received canceled match event", data);
              if (
                [
                  "DRIVER_CANCELED",
                  // todo: add other canceled status here
                ].includes(data?.status)
              ) {
                callback(data);
              }
            }
          )
          .subscribe();

        log.debug("Subscribed to canceled match event", {
          userId,
          channel: "matches.canceled",
          filter: `passenger_id=eq.${userId}`,
          table: "matches",
          schema: "public",
        });
      }
    }
    return () => {
      channel?.unsubscribe?.();
      log.debug("Unsubscribed from canceled match event");
    };
  }, [isInMatchScreen]);
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
