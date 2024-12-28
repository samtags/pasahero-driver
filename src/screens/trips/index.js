import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Alert, Linking } from "react-native";
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
import useRenderCounter from "@/src/services/hooks/useRenderCounter";
import getOngoingTrips from "@/src/services/api/getOngoingTrips";
import getDriverProfile from "@/src/services/api/getDriverProfile";
import getIncomingTrip from "@/src/services/api/getIncomingTrip";
import { handleSetStatus } from "@/src/services/controller";
import useOnFocus from "@/src/services/hooks/useOnFocus";
import JSON from "@/src/services/json";

let timeout;
export default function Trips() {
  useRenderCounter("Trips");

  const alreadyPromptedTimeout = useRef(false);
  const [tripRequest] = useMMKVObject("__tmp_trip.request");
  const [activeTrip, setActiveTrip] = useMMKVObject("__tmp_trip.active");
  const tripSnapshot = useTrip(activeTrip?.id, undefined);

  const [trip, setTrip] = useState(null);
  const [isExpiring, setIsExpiring] = useState(false);
  const [activeTab, setActiveTab] = useState("MAIN"); // MAIN, NEARBY, HISTORY

  const take = useTakeTrip(trip?.id);
  const refuse = useRejectTrip(trip?.id);

  useOnFocus(() => {
    console.debug("Getting incoming trip request");
    getIncomingTripRequest();
  });

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
    try {
      await take?.send();

      clearTimeout(timeout);
      setIsExpiring(false);
      storage.delete("__tmp_trip.request");

      let _trip;
      setTrip((prev) => {
        _trip = { ...prev, status: "FOUND" };

        setActiveTrip(_trip);
        return _trip;
      });
    } catch (err) {
      console.debug("Unable to accept trip request.", err);
      const errorCode = err.data?.error;

      if (errorCode === "WALLET_INSUFFICIENT") {
        return Alert.alert(
          "Wallet Insufficient",
          "We're sorry, but you don't have enough balance to take this trip. Please top up to accept more trips!",
          [
            {
              text: "OK",
              onPress: () => {
                router.navigate({ pathname: "/(tabs)/wallet" });
                refuse?.send();
                reset();
              },
            },
          ]
        );
      }

      if (errorCode === "DRIVER_BUSY") {
        return Alert.alert(
          "Not allowed",
          "You have an ongoing trip. Please complete your ongoing trip before accepting a new one.",
          [
            {
              text: "OK",
              onPress: () => {
                refuse?.send();
                reset();
                getOngoingTrips().then((trips) => {
                  if (trips?.[0]) {
                    storage.set("__tmp_trip.active", JSON.stringify(trips[0]));
                  }
                });
              },
            },
          ]
        );
      }

      if (errorCode === "ALREADY_TAKEN" || errorCode === "ALREADY_TIMED_OUT") {
        return Alert.alert(
          "Already taken",
          "We're sorry, but this trip has already been taken by another driver.",
          [
            {
              text: "OK",
              onPress: () => {
                refuse?.send();
                reset();
              },
            },
          ]
        );
      }

      if (errorCode === "ACCEPT_LIMIT_EXCEEDED") {
        const profile_id = storage.getString("user.profile_id");
        getDriverProfile(profile_id).then((profile) => {
          if (profile) router.setParams("/register", profile);
        });
        return Alert.alert(
          "Accept Limit Exceeded",
          "Submit a proof of profile to accept more trips.",
          [
            {
              text: "OK",
              onPress: () => {
                router.navigate({
                  pathname: "/register",
                  params: {
                    id: profile_id,
                    status: "ACCEPTED",
                  },
                });
                reset();
              },
            },
          ]
        );
      }

      if (errorCode === "PROFILE_INVALID") {
        const profile_id = storage.getString("user.profile_id");
        getDriverProfile(profile_id).then((profile) => {
          if (profile) router.setParams("/register", profile);
        });

        return Alert.alert(
          "Data Missing",
          "Some information is needed for us to show details to the passengers. Please provide the necessary data.",
          [
            {
              text: "OK",
              onPress: () => {
                router.navigate({
                  pathname: "/register",
                  params: {
                    id: profile_id,
                    status: "ACCEPTED",
                  },
                });
                refuse?.send();
                reset();
              },
            },
          ]
        );
      }

      if (errorCode === "PROFILE_DECLINED") {
        const profile_id = storage.getString("user.profile_id");
        getDriverProfile(profile_id) //
          .then((profile) => {
            if (profile) router.setParams("/register", profile);
          });

        return Alert.alert(
          "Oops!",
          "There's a problem with your profile. Please check it and make sure all the information are correct.",
          [
            {
              text: "OK",
              onPress: () => {
                // todo: redirect to registration
                router.navigate({
                  pathname: "/register",
                  params: {
                    id: profile_id,
                    status: "DECLINED",
                  },
                });
                refuse?.send();
                reset();
              },
            },
          ]
        );
      }

      if (errorCode === "PROFILE_PENDING") {
        return Alert.alert(
          "Profile in Review",
          "Your profile is currently being reviewed. We will notify you in a few minutes."
        );
      }

      if (errorCode === "PROFILE_EMPTY") {
        return Alert.alert(
          "Data Missing",
          "Some information is needed for us to show details to the passengers. Please provide the necessary data.",
          [
            {
              text: "OK",
              onPress: () => {
                refuse?.send();
                reset();
                router.navigate({
                  pathname: "/register",
                  params: {
                    id: storage.getString("user.profile_id"),
                  },
                });
              },
            },
          ]
        );
      }

      if (errorCode === "WAITING_ACKNOWLEDGEMENT") {
        return Alert.alert(
          "Please try again later",
          "We're sorry, but this trip has already been requested to another driver."
        );
      }
    }
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

  function handleMessage() {
    router.navigate({
      pathname: "/chat",
      params: {
        id: trip?.id,
        passenger_id: trip?.passenger_id,
      },
    });
  }

  function handlePressPickup() {
    Linking.openURL(
      `https://waze.com/ul?ll=${trip.first_point.latitude},${trip.first_point.longitude}&navigate=yes`
    );
  }

  function handlePressDropoff() {
    Linking.openURL(
      `https://waze.com/ul?ll=${trip.last_point.latitude},${trip.last_point.longitude}&navigate=yes`
    );
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
    console.debug("Trips screen mounted.");
    getOngoingTrips().then((trips) => {
      if (trips?.[0]) {
        storage.set("__tmp_trip.active", JSON.stringify(trips[0]));
      }
    });
  }, []);

  useEffect(() => {
    if (activeTrip?.id) {
      console.debug("Updating from active trip.");
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

  useOnUpdate(() => {
    if (trip?.status) {
      switch (trip?.status) {
        case "PASSENGER_CANCELED":
          setTrip();

          storage.delete("__tmp_trip.request");
          storage.delete("__tmp_trip.active");

          Alert.alert(
            "Trip Canceled",
            "The trip has been canceled by the passenger."
          );
          break;

        default:
          break;
      }
    }
  }, [trip?.status]);

  const estimate_preview =
    trip?.fare?.[trip?.service]?.estimate_preview ||
    trip?.fare?.estimate_preview;

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

      <Tabs
        tripStatus={trip?.status}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <Optional condition={activeTab === "MAIN" && Boolean(trip)}>
        <Trip
          id={trip?.id}
          first_point={trip?.first_point}
          last_point={trip?.last_point}
          notes={trip?.notes}
          payment_method={trip?.payment_method}
          will_add_tip={trip?.will_add_tip}
          status={trip?.status}
          estimate_preview={estimate_preview}
          isTaking={take.isPending}
          isRefusing={refuse.isPending}
          handleTake={handleAccept}
          handleRefuse={handleRefuse}
          isExpiring={isExpiring}
          setTrip={setTrip}
          handleMessage={handleMessage}
          handlePressDropoff={handlePressDropoff}
          handlePressPickup={handlePressPickup}
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

export function getIncomingTripRequest() {
  getIncomingTrip().then((trip) => {
    storage.set("__tmp_trip.request", JSON.stringify(trip));
    handleSetStatus("INACTIVE");
  });
}
