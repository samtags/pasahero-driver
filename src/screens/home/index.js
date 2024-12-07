import { StyleSheet, View, TouchableOpacity } from "react-native";
import Mapbox from "@rnmapbox/maps";
import Text from "@/src/components/text";
import Ionicons from "@expo/vector-icons/Ionicons";
import Optional from "@/src/components/optional";
import useController from "@/src/services/controller";
import * as Linking from "expo-linking";
import Registration from "@/src/screens/home/components/registration";
import Tooltip from "rn-tooltip";
import { useEffect, useRef } from "react";
import storage from "@/src/services/storage";
import useLocation from "@/src/services/hooks/useLocation";

export default function Home() {
  const cameraRef = useRef();
  const tooltipRef = useRef(null);

  const isMapInitialized = true;
  const controller = useController();
  const location = useLocation();

  const status = controller.status;
  const error = controller.error;

  useEffect(() => {
    const firstTime = storage.getBoolean("settings.app.firstTime");
    if (firstTime === undefined) tooltipRef.current?.toggleTooltip();
  }, []);

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

  function handlePressCallToAction() {
    if (tooltipRef?.current?.state?.isVisible) {
      storage.set("settings.app.firstTime", false);
      tooltipRef?.current?.toggleTooltip();
    }

    controller.handlePress();
  }

  function handleCenterMap() {
    if (cameraRef?.current) {
      const location = JSON.parse(storage.getString("user.location"));

      if (location.longitude && location.latitude) {
        cameraRef.current.setCamera({
          centerCoordinate: [location?.longitude, location?.latitude],
          zoomLevel: 16.5,
          animationMode: "flyTo",
          animationDuration: 1500,
          heading: location?.heading,
        });
      }
    }
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
          animationMode="none"
          centerCoordinate={[location.longitude, location.latitude]}
          followHeading={location.heading}
          heading={location.heading}
          key="static-camera"
          pitch={40}
          ref={cameraRef}
          zoomLevel={15}
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
                  Kailangan namin ang iyong pahintulot sa pag access ng
                  location. Piliin ang "Allow all the time" para makapag
                  patuloy.
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
          <TouchableOpacity onPress={handleCenterMap}>
            <View style={styles.iconCircle}>
              <Ionicons name="locate-sharp" size={32} color="#6366F1" />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.statusContainer}>
          <View style={{ alignItems: "center" }}>
            <Tooltip
              ref={tooltipRef}
              backgroundColor="#363F59"
              height={50}
              width={220}
              pointerStyle={{ marginTop: -44 }}
              containerStyle={{ marginLeft: 90, marginTop: -44 }}
              popover={<Text color="white">Pindutin para mag simula</Text>}
            >
              <TouchableOpacity
                onPress={handlePressCallToAction}
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
            </Tooltip>
          </View>
          <View style={styles.statusRow}>
            <Text weight="bold" size={18}>
              {status === "ACTIVE" ? "Online ka na!" : "Ikaw ay offline"}
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
