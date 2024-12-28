import { memo } from "react";
import {
  View,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import Cta from "@/src/components/cta";
import { useTakeTrip } from "../../trips";
import Optional from "@/src/components/optional";
import getTrip from "@/src/services/api/getTrip";
import { useQuery } from "@tanstack/react-query";
import router from "@/src/services/router";
import getOngoingTrips from "@/src/services/api/getOngoingTrips";
import storage from "@/src/services/storage";
import { removeTrip } from "@/src/services/hooks/useNearby";
import { Image } from "expo-image";
import { current, first, last } from "@/src/services/images/remote";
import getDistance from "@/src/services/util/haversine/getDistance";
import Text from "@/src/components/text";
import { styles } from "@/src/screens/trips/components/trip";
import getColorByService from "@/src/services/util/colors/getColorByService";
import getDriverProfile from "@/src/services/api/getDriverProfile";

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

  const location = JSON.parse(storage.getString("user.location"));

  const distance = getDistance(
    location?.latitude,
    location?.longitude,
    trip?.first_point?.latitude,
    trip?.first_point?.longitude
  );

  async function handleTake() {
    console.debug("Taking trip...");
    try {
      await take.send();

      console.debug("Successfully took trip");
      const active = { ...trip, status: "FOUND" };
      storage.set("__tmp_trip.active", JSON.stringify(active));

      router.navigate({ pathname: "/(tabs)/trips" });
      onClose();
      removeTrip(id);
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
                onClose();
                router.navigate({ pathname: "/(tabs)/wallet" });
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
                onClose();
                router.navigate({ pathname: "/(tabs)/trips" });
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
                onClose();
                router.navigate({
                  pathname: "/register",
                  params: {
                    id: profile_id,
                    status: "ACCEPTED",
                  },
                });
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
                onClose();
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
                onClose();
                router.navigate({
                  pathname: "/register",
                  params: {
                    id: storage.getString("user.profile_id"),
                    status: "DECLINED",
                  },
                });
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

      if (errorCode === "WAITING_ACKNOWLEDGEMENT") {
        return Alert.alert(
          "Please try again later",
          "We're sorry, but this trip has already been requested to another driver."
        );
      }
    }
  }

  const service = storage.getString("user.service");
  const color = getColorByService(service);

  const estimate_preview =
    trip?.fare?.[service]?.estimate_preview || trip?.fare?.estimate_preview;

  return (
    <View
      style={{
        position: "absolute",
        top: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "#f9fafb",
      }}
    >
      <View style={{ flex: 1 }}>
        <Optional
          condition={isLoading === false}
          fallback={
            <View style={{ alignItems: "center", padding: 16 }}>
              <ActivityIndicator size="large" color="#363F59" />
            </View>
          }
        >
          <ScrollView contentContainerStyle={{ gap: 24, padding: 16 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Image
                source={current}
                style={{ width: 40, height: 40 }}
                cachePolicy="memory-disk"
              />
              <View style={{ gap: 4 }}>
                <Text weight="700" size={18} color="#1B1B1B">
                  Current Location
                </Text>
                <Optional condition={distance}>
                  <Text size={14} color="#707070">
                    Approximately {distance} km away from pickup
                  </Text>
                </Optional>
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity>
                <Image
                  source={first}
                  style={{ width: 40, height: 40 }}
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>
              <TouchableWithoutFeedback>
                <View style={{ gap: 4, flex: 1 }}>
                  <Text weight="700" size={18} color="#1B1B1B">
                    {trip?.first_point?.short_address}
                  </Text>
                  <Text size={14} color="#707070">
                    {trip?.first_point?.long_address}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity>
                <Image
                  source={last}
                  style={{ width: 40, height: 40 }}
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>
              <TouchableWithoutFeedback>
                <View style={{ gap: 4, flex: 1 }}>
                  <Text weight="700" size={18} color="#1B1B1B">
                    {trip?.last_point?.short_address}
                  </Text>
                  <Text size={14} color="#707070">
                    {trip?.last_point?.long_address}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>

            <View style={{ gap: 7 }}>
              <Text size={18} weight="700" color="#707070">
                Notes
              </Text>
              <Text weight="700" size={18} color="#1B1B1B">
                {trip?.notes || "-"}
              </Text>
            </View>

            <View style={styles.paymentTypeContainer}>
              <View>
                <Text size={18} weight="700" color="#707070">
                  Payment Type
                </Text>
              </View>
              <View style={styles.paymentTypeChip(color)}>
                <Text size={18} weight="700" color="#FFF">
                  {trip?.payment_method || "Cash"}
                </Text>
              </View>
            </View>

            <View style={styles.serviceChargeContainer}>
              <View style={{ flex: 1, gap: 7 }}>
                <Text size={18} weight="700" color="#707070">
                  Service Charge
                </Text>
                <Text size={14} color="#707070">
                  Kindly collect service charge to the passenger. On top of the
                  fare and tip.
                </Text>
              </View>
              <View style={styles.serviceChargeChip}>
                <Text
                  size={14}
                  color="#fff"
                  style={{
                    textDecorationLine: "line-through",
                    textDecorationStyle: "solid",
                  }}
                >
                  P 10.00
                </Text>
                <Text size={18} weight="700" color="#fff">
                  P 0.00
                </Text>
              </View>
            </View>

            <View style={{ alignItems: "center", marginTop: 64 }}>
              <View style={{ position: "relative", gap: 4 }}>
                <Text size={14} weight="700" color="#707070">
                  Estimated Fare
                </Text>
              </View>
            </View>

            <Text textAlign="center" size={34} color="#353579" weight="700">
              {estimate_preview} {trip?.will_add_tip && "+"}
            </Text>
            <View>
              <Text textAlign="center" size={13} color="#707070">
                Estimation is based on fare structure set by LTFRB.
              </Text>
              <Text textAlign="center" size={13} color="#707070">
                Estimated fare may vary in the actual trip in the application.
              </Text>
            </View>
          </ScrollView>
        </Optional>
      </View>
      <View style={styles.ctaContainer}>
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
