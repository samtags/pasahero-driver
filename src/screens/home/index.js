import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import Mapbox from "@rnmapbox/maps";
import Text from "@/src/components/text";
import Ionicons from "@expo/vector-icons/Ionicons";
import Optional from "@/src/components/optional";
import * as controller from "@/src/services/controller";
import useController from "@/src/services/controller";
import * as Linking from "expo-linking";
import WheelPicker from "@quidone/react-native-wheel-picker";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import createProfile from "@/src/services/api/createProfile";

const defaultCenterCoordinate = [120.9763782, 14.5869407];

export default function Home() {
  const isMapInitialized = true;
  const controller = useController();

  const status = controller.status;
  const error = controller.error;

  function handleRedirectToSettings() {
    controller.clearError();

    const canAsk = storage.getBoolean(
      "settings.location.foreground.canAskAgain"
    );

    if (canAsk === false) {
      Linking.openSettings();
    }
  }

  function handleCloseRegistrationPicker() {
    controller.clearError();
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F4", position: "relative" }}>
      <Mapbox.MapView
        scaleBarEnabled={false}
        style={[styles.map, { opacity: isMapInitialized ? 1 : 0 }]}
        logoPosition={{ top: -100, left: 0 }}
        attributionEnabled={false}
        styleURL="mapbox://styles/mapbox/streets-v12"
      >
        <Mapbox.Camera
          key="static-camera"
          zoomLevel={15}
          animationMode="none"
          centerCoordinate={defaultCenterCoordinate}
          pitch={40}
        />
      </Mapbox.MapView>

      <View style={{ position: "absolute", top: "0", width: "100%" }}>
        <View style={{ padding: 24, gap: 8 }}>
          <Optional condition={error === "NO_PROFILE"}>
            <View style={{ backgroundColor: "white", padding: 16 }}>
              <Text>Piliin ang platform na iyong gamit.</Text>
            </View>
          </Optional>

          <Optional condition={error === "NO_USER"}>
            <TouchableOpacity onPress={() => controller.clearError()}>
              <View style={{ backgroundColor: "white", padding: 16 }}>
                <Text>Mag sign-in upang makapag patuloy.</Text>
              </View>
            </TouchableOpacity>
          </Optional>

          <Optional condition={error === "ONGOING_TRIP"}>
            <TouchableOpacity onPress={() => controller.clearError()}>
              <View style={{ backgroundColor: "white", padding: 16 }}>
                <Text>
                  Sorry pero mayroon kapang ongoing na trip. I-complete muna ang
                  trip upang makapag patuloy.
                </Text>
              </View>
            </TouchableOpacity>
          </Optional>

          <Optional condition={error === "NO_BALANCE"}>
            <TouchableOpacity onPress={() => controller.clearError()}>
              <View style={{ backgroundColor: "white", padding: 16 }}>
                <Text>
                  Kulang na ang iyong wallet. Mag top-up para makakuha ng bagong
                  trips.
                </Text>
              </View>
            </TouchableOpacity>
          </Optional>

          <Optional condition={error === "BACKGROUND_LOCATION_DENIED"}>
            <TouchableOpacity onPress={() => controller.clearError()}>
              <View style={{ backgroundColor: "white", padding: 16 }}>
                <Text>
                  Inirerequire namin ang location permission. Mangyaring i-set
                  ito "Allow all the time" upang makapag patuloy.
                </Text>
              </View>
            </TouchableOpacity>
          </Optional>

          <Optional condition={error === "LOCATION_DENIED"}>
            <TouchableOpacity onPress={handleRedirectToSettings}>
              <View style={{ backgroundColor: "white", padding: 16 }}>
                <Text>
                  Inirerequire namin ang location permission. Mangyaring i-allow
                  ito upang makapag patuloy.
                </Text>
              </View>
            </TouchableOpacity>
          </Optional>
        </View>
      </View>

      <View style={{ position: "absolute", bottom: "0", width: "100%" }}>
        <View style={styles.iconContainers}>
          <TouchableOpacity>
            <View style={styles.iconCircle}>
              <Ionicons name="locate-sharp" size={32} color="#6366F1" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.statusContainer}>
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              onPress={controller.handlePress}
              style={{ marginTop: -37.5 }}
            >
              <View style={styles.callToAction}>
                <Ionicons
                  name={status === "ACTIVE" ? "stop" : "power-outline"}
                  size={32}
                  color="white"
                />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.statusRow}>
            <Text weight="bold" size={18}>
              {status === "ACTIVE" ? "You are now online" : "You are offline"}
            </Text>
          </View>
        </View>
      </View>

      <Optional condition={error === "NO_PROFILE"}>
        <Registration onClose={handleCloseRegistrationPicker} />
      </Optional>
    </View>
  );
}

const options = [
  { label: "Angkas", value: "angkas" },
  { label: "JoyRide", value: "mc-taxi" },
  { label: "Move It", value: "moto-taxi" },
];

function Registration({ onClose = () => {} }) {
  const [selected, setSelected] = useState({
    label: "Angkas",
    value: "angkas",
  });

  const { isPending, mutateAsync } = useMutation({
    mutationFn: () => createProfile(selected.value),
  });

  async function handleSelect() {
    const response = await mutateAsync();

    if (response.id) {
      onClose();
      controller.handlePress();
    } else {
      Alert.alert("Unable to create profile.", "Please try again later.", [
        {
          text: "Close",
          style: "default",
          onPress: () => onClose(),
        },
      ]);
    }
  }

  return (
    <View
      style={{
        position: "absolute",
        bottom: "0",
        width: "100%",
        zIndex: 1,
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 16,
          position: "relative",
        }}
      >
        <TouchableOpacity disabled={isPending} onPress={onClose}>
          <Text size={18} color="#707070">
            Isara
          </Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={isPending} onPress={handleSelect}>
          <Text size={18} weight="bold">
            Piliin
          </Text>
        </TouchableOpacity>
        <View
          style={{
            position: "absolute",
            bottom: 0,
            top: 0,
            left: 0,
            right: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text color="#707070" size={18}>
            Platform
          </Text>
        </View>
      </View>
      <WheelPicker
        data={options}
        onValueChanging={(option) => {
          setSelected(option?.item);
        }}
        itemTextStyle={styles.itemTextStyle}
        style={styles.profileWheel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  iconContainers: {
    padding: 16,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  iconCircle: {
    backgroundColor: "white",
    height: 50,
    width: 50,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  statusContainer: {
    backgroundColor: "white",
    padding: 24,
    paddingTop: 0,
    position: "relative",
    gap: 16,
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  callToAction: {
    backgroundColor: "#6366F1",
    height: 75,
    width: 75,
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: (color) => ({
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: color,
  }),
  profileWheel: {
    backgroundColor: "white",
    width: "100%",
    height: 280,
  },
  itemTextStyle: {
    fontFamily: "Lato-Regular",
  },
});
