import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { MotiView } from "moti";
import Optional from "@/src/components/optional";
import Trip from "./components/trip";
import Tabs from "./components/tabs";
import router from "@/src/services/router";
import { useMutation } from "@tanstack/react-query";
import takeTripRequest from "@/src/services/api/takeTripRequest";
import rejectTripRequest from "@/src/services/api/rejectTripRequest";
import subscribe from "@/src/services/realtime";
import { useMMKVObject } from "react-native-mmkv";
import storage from "@/src/services/storage";
import useTrip from "@/src/services/queries/useTrip";
import useOnUpdate from "@/src/services/hooks/useOnUpdate";

let timeout;
export default function Trips() {
  const alreadyPromptedTimeout = useRef(false);
  const [tripRequest] = useMMKVObject("__tmp_trip.request");
  const [activeTrip, setActiveTrip] = useMMKVObject("__tmp_trip.active");
  const tripSnapshot = useTrip(activeTrip?.id, undefined);

  const [trip, setTrip] = useState(null);
  const [isExpiring, setIsExpiring] = useState(false);
  const [activeTab, setActiveTab] = useState("MAIN"); // MAIN, NEARBY, HISTORY

  const take = useTakeTrip(trip?.id);
  const refuse = useRejectTrip(trip?.id);

  useOnTripTimeoutWarning(trip?.id, handleOnTripTimeoutWarning);
  useOnTripTimeout(trip?.id, handleOnTripTimeout);

  function reset() {
    setTrip(null);
    setIsExpiring(false);
    storage.delete("__tmp_trip.request");
    clearTimeout(timeout);
    alreadyPromptedTimeout.current = true;
  }

  async function handleRefuse() {
    await refuse?.send();
    reset();
    router.navigate({ pathname: "/" });
  }

  async function handleAccept() {
    let error;

    try {
      await take?.send();
    } catch (err) {
      error = err;
      console.debug("Unable to accept trip request.", err);

      // todo: handler error codes
      if (err.data?.error === "ACCEPT_LIMIT_EXCEEDED") {
      }
    }

    if (error) return;

    clearTimeout(timeout);
    setIsExpiring(false);
    storage.delete("__tmp_trip.request");

    let _trip;
    setTrip((prev) => {
      _trip = { ...prev, status: "FOUND" };

      setActiveTrip(_trip);
      return _trip;
    });
  }

  function handleOnTripTimeout() {
    if (alreadyPromptedTimeout.current) {
      console.debug("Already prompted for trip timeout.");
      return;
    }

    console.debug("Prompting for trip timeout.");

    reset();
    Alert.alert(
      "Trip Ignored",
      "No action was taken, and the trip request has expired.",
      [
        {
          text: "Close",
          style: "default",
          onPress: () => router.navigate({ pathname: "/" }),
        },
      ]
    );

    alreadyPromptedTimeout.current = true;
  }

  function handleOnTripTimeoutWarning() {
    console.debug("Showing trip timeout warning.");
    setIsExpiring(true);
  }

  function handleOnTripTimeoutByWarning() {
    console.debug("Handling trip timeout by warning.");
    handleOnTripTimeout();
  }

  function handleOnTripTimeoutFallback() {
    console.debug("Handling trip timeout by fallback.");
    handleOnTripTimeout();
  }

  useEffect(() => {
    console.debug("Detected change from router params", {
      data: tripRequest,
      trip,
    });
    if (tripRequest && !trip && tripRequest.status === "REQUESTED") {
      console.debug("Rehydrating trip details by router params update");

      setTrip(tripRequest);
      // set state
      storage.set("__tmp_trip.request", JSON.stringify(tripRequest));
      alreadyPromptedTimeout.current = false;
      setIsExpiring(false);
      clearTimeout(timeout);

      console.debug("Setting fallback timeout for this trip request.");
      timeout = setTimeout(handleOnTripTimeoutFallback, 35_000);
    }

    return () => clearTimeout(timeout);
  }, [tripRequest]);

  useEffect(() => {
    if (activeTrip?.id) {
      setTrip(activeTrip);
    }
  }, [activeTrip]);

  useOnUpdate(() => {
    if (tripSnapshot?.id) {
      console.debug("Updating trip state from snapshot", {
        tripSnapshot,
        trip,
      });

      setTrip(tripSnapshot);
    }
  }, [tripSnapshot]);

  return (
    <View style={styles.container}>
      <Optional
        condition={
          isExpiring && activeTab === "MAIN" && trip?.status === "REQUESTED"
        }
      >
        <MotiView
          from={{ width: "40%", height: 4 }}
          animate={{ width: 0 }}
          transition={{ type: "timing", duration: 15_000 }}
          style={styles.progressBar}
          onDidAnimate={handleOnTripTimeoutByWarning}
        />
      </Optional>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <Optional condition={activeTab === "MAIN" && Boolean(trip)}>
        <Trip
          first_point={trip?.first_point}
          last_point={trip?.last_point}
          notes={trip?.notes}
          payment_method={trip?.payment_method}
          will_add_tip={trip?.will_add_tip}
          status={trip?.status}
          estimate_preview={
            trip?.fare?.[trip?.service]?.estimate_preview ||
            trip?.fare?.estimate_preview
          }
          isTaking={take.isPending}
          isRefusing={refuse.isPending}
          handleTake={handleAccept}
          handleRefuse={handleRefuse}
          isExpiring={isExpiring}
        />
      </Optional>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  spacer: {
    padding: 4,
    gap: 8,
  },
  tab: {
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3.5,
    borderColor: "#6366F1",
  },
  scrollView: {
    padding: 24,
    gap: 12,
    backgroundColor: "#f9fafb",
  },
  canceledScrollView: {
    padding: 24,
    paddingBottom: 0,
    gap: 12,
    backgroundColor: "#f9fafb",
  },
  serviceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  angkas: { backgroundColor: "#0090F9" },
  joyRide: { backgroundColor: "#181ACA" },
  moveIt: { backgroundColor: "#EF4444" },
  cardHeader: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
  },
  cardContainer: {
    borderBottomColor: "#EAEAEA",
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
  progressBar: {
    height: 7,
    backgroundColor: "#F59E0B",
  },
  paymentTypeContainer: {
    gap: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  paymentTypeChip: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
  },
  serviceChargeContainer: {
    marginTop: 16,
    gap: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  serviceChargeChip: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipChip: {
    backgroundColor: "#6366F1",
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 2,
    borderRadius: 10,
    position: "absolute",
    left: 101,
    top: -2,
  },
});

export function useIncomingRequest() {
  const [trip] = useMMKVObject("__tmp_trip.request");
  return trip;
}

export function useTakeTrip(id) {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => takeTripRequest(id),
  });

  return { send: mutateAsync, isPending };
}

function useRejectTrip(id) {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => rejectTripRequest(id),
  });

  return { send: mutateAsync, isPending };
}

function useOnTripTimeoutWarning(id, callback) {
  useEffect(() => {
    let unsubscribe;

    if (id) {
      unsubscribe = subscribe(`trip_request_timeout_warning.${id}`, callback);
    }

    return () => unsubscribe?.();
  }, [id]);
}

function useOnTripTimeout(id, callback) {
  useEffect(() => {
    let unsubscribe;

    if (id) {
      unsubscribe = subscribe(`trip_request_timeout.${id}`, callback);
    }

    return () => unsubscribe?.();
  }, [id]);
}
