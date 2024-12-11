import { memo, useEffect, useState } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import Cta from "@/src/components/cta";
import { useTakeTrip } from "../../trips";
import Optional from "@/src/components/optional";
import getTrip from "@/src/services/api/getTrip";
import { useQuery } from "@tanstack/react-query";
import router from "@/src/services/router";
import getOngoingTrips from "@/src/services/api/getOngoingTrips";
import storage from "@/src/services/storage";
import { removeTrip } from "@/src/services/hooks/useNearby";

export default memo(function Preview({
  id,
  onClose = () => {},
  onRegister = () => {},
}) {
  const take = useTakeTrip(id);

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: () => getTrip(id),
  });

  async function handleTake() {
    try {
      await take.send();

      onClose();
    } catch (err) {
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
                onClose();
              },
            },
          ]
        );
      }

      if (errorCode === "DRIVER_BUSY") {
        const active = storage.getString("__tmp_trip.active");

        if (!active) {
          getOngoingTrips().then((trips) => {
            if (trips?.[0]) {
              storage.set("__tmp_trip.active", JSON.stringify(trips[0]));
            }
          });
        }

        return Alert.alert(
          "Not allowed",
          "You have an ongoing trip. Please complete your ongoing trip before accepting a new one.",
          [
            {
              text: "OK",
              onPress: () => {
                router.navigate({ pathname: "/(tabs)/trips" });
                onClose();
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
                removeTrip(id);
                onClose();
              },
            },
          ]
        );
      }

      if (errorCode === "ACCEPT_LIMIT_EXCEEDED") {
        return Alert.alert(
          "Accept Limit Exceeded",
          "Submit a proof of profile to accept more trips.",
          [
            {
              text: "OK",
              onPress: () => {
                router.navigate({ pathname: "/(tabs)/settings" });
              },
            },
          ]
        );
      }

      if (errorCode === "PROFILE_INVALID") {
        return Alert.alert(
          "Data Missing",
          "Some information is needed for us to show details to the passengers. Please provide the necessary data.",
          [
            {
              text: "OK",
              onPress: () => {
                router.navigate({ pathname: "/(tabs)/settings" });
                onClose();
              },
            },
          ]
        );
      }

      if (errorCode === "PROFILE_DECLINED") {
        return Alert.alert(
          "Oops!",
          "There's a problem with your profile. Please check it and make sure all the information are correct.",
          [
            {
              text: "OK",
              onPress: () => {
                router.navigate({ pathname: "/(tabs)/settings" });
                onClose();
              },
            },
          ]
        );
      }

      if (errorCode === "PROFILE_PENDING") {
        return Alert.alert(
          "Profile in Review",
          "Your profile is currently being reviewed. We will notify you in a few minutes.",
          [
            {
              text: "OK",
              onPress: () => {
                onClose();
              },
            },
          ]
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
                onClose();
                onRegister();
              },
            },
          ]
        );
      }
    }
  }

  return (
    <View
      style={{
        position: "absolute",
        top: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "#f9fafb",
        padding: 16,
      }}
    >
      <View style={{ flex: 1 }}></View>
      <View style={{ flexShrink: 0 }}>
        <Optional condition={take.isPending}>
          <ActivityIndicator size="large" color="#10B981" />
        </Optional>

        <Optional condition={Boolean(take.isPending) === false}>
          <Cta onPress={onClose} color="transparent" textColor="#000">
            Close
          </Cta>
          <Cta onPress={handleTake} color={isLoading ? "#B7EAD9" : "#10B981"}>
            Take
          </Cta>
        </Optional>
      </View>
    </View>
  );
});
