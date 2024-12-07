import { StyleSheet, View, TouchableOpacity } from "react-native";
import Mapbox from "@rnmapbox/maps";
import Text from "@/src/components/text";
import Ionicons from "@expo/vector-icons/Ionicons";
import Optional from "@/src/components/optional";
import useController from "@/src/services/controller";
import * as Linking from "expo-linking";
import Tooltip from "rn-tooltip";
import { useEffect, useRef } from "react";
import storage from "@/src/services/storage";
import useLocation from "@/src/services/hooks/useLocation";
import useDriverIcon from "@/src/services/hooks/useDriverIcon";
import getColorByService from "@/src/services/util/colors/getColorByService";
import Registration from "@/src/screens/home/components/registration";
import Center from "@/src/screens/home/components/center";

export default function Home() {
  const cameraRef = useRef();
  const tooltipRef = useRef(null);

  const isMapInitialized = true;
  const controller = useController();
  const location = useLocation();

  const driverIcon = useDriverIcon();

  const status = controller.status;
  const error = controller.error;

  const featureCollection = {
    type: "FeatureCollection",
    features: [],
  };

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
          zoomLevel: 15,
          animationMode: "flyTo",
          animationDuration: 1500,
          heading: location?.heading,
        });
      }
    }
  }

  if (!location.fallback) {
    featureCollection.features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [location.longitude, location.latitude],
      },
      properties: {
        id: "driver",
        rotation: location.heading,
      },
    });
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
          centerCoordinate={[location.longitude, location.latitude]}
          followHeading={location.heading}
          heading={location.heading}
          key="static-camera"
          pitch={40}
          ref={cameraRef}
          zoomLevel={15}
        />

        <Mapbox.Images
          images={{
            driverIcon,
          }}
        />

        <Mapbox.ShapeSource id="feature-collection" shape={featureCollection}>
          <Mapbox.SymbolLayer
            id="driver"
            style={{
              iconImage: "driverIcon",
              iconAllowOverlap: true,
              iconRotate: ["get", "rotation"],
              iconRotationAlignment: "map",
              iconSize: 0.225,
              iconAnchor: "center",
            }}
            filter={["==", ["get", "id"], "driver"]}
          />
        </Mapbox.ShapeSource>
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
          <Center onPress={handleCenterMap} />
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
                <View style={styles.callToAction()}>
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
  callToAction: () => {
    const service = storage.getString("user.service");
    const status = storage.getString("controller.status");

    let color = "#6366F1";

    if (status === "ACTIVE") color = getColorByService(service);

    return {
      backgroundColor: color,
      height: 75,
      width: 75,
      borderRadius: 75,
      justifyContent: "center",
      alignItems: "center",
    };
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
