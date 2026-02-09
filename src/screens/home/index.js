import { StyleSheet, View, TouchableOpacity } from "react-native";
import Mapbox from "@rnmapbox/maps";
import Text from "@/src/components/text";
import Ionicons from "@expo/vector-icons/Ionicons";
import Optional from "@/src/components/optional";
import useController from "@/src/services/controller";
import * as Linking from "expo-linking";
import { useCallback, useEffect, useRef, useState } from "react";
import storage from "@/src/services/storage";
import useLocation from "@/src/services/hooks/useLocation";
import useDriverIcon from "@/src/services/hooks/useDriverIcon";
import getColorByService from "@/src/services/util/colors/getColorByService";
import Registration from "@/src/screens/home/components/registration";
import Center from "@/src/screens/home/components/center";
import {
  getIncomingTripRequest,
  useIncomingRequest,
} from "@/src/screens/trips";
import router from "@/src/services/router";
import getIncomingTrip from "@/src/services/api/getIncomingTrip";
import useRenderCounter from "@/src/services/hooks/useRenderCounter";
import { point, plate } from "@/src/services/images/remote";
import useNearby from "@/src/services/hooks/useNearby";
import TripMarker from "@/src/screens/home/components/marker";
import Preview from "@/src/screens/home/components/preview";
import JSON from "@/src/services/json";
import useOnAppFocus from "@/src/services/hooks/useFocus";
import useOnFocus from "@/src/services/hooks/useOnFocus";

export default function Home() {
  useRenderCounter("Home");
  const cameraRef = useRef();
  const tooltipRef = useRef(null);

  const [selected, setSelected] = useState();

  const isMapInitialized = true;
  const controller = useController();
  const location = useLocation();

  const driverIcon = useDriverIcon();
  const tripRequest = useIncomingRequest();

  const status = controller.status;
  const error = controller.error;

  const featureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  const { trips: nearby, onCameraChanged } = useNearby();

  useOnAppFocus(() => {
    console.debug("App refocused. Checking for incoming trips.");
    getIncomingTripRequest();
  });

  useOnFocus(() => {
    console.debug("Refocused in home screen. Checking for incoming trips.");
    getIncomingTripRequest();
  });

  useEffect(() => {
    const firstTime = storage.getBoolean("settings.app.firstTime");
    if (firstTime === undefined) tooltipRef.current?.toggleTooltip();

    getIncomingTrip().then((trip) => {
      if (trip) {
        console.debug("There is incoming trip. Prompting in home screen.");
        if (trip.status === "REQUESTED") {
          storage.set("__tmp_trip.request", JSON.stringify(trip));
        }
      }
    });
  }, []);

  function handleRedirectToSettings() {
    controller.clearError();

    const canAsk = storage.getBoolean(
      "settings.location.foreground.canAskAgain",
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
    handleCenterMap();
  }

  const closePreview = useCallback(() => {
    setSelected();
  }, []);

  const onRegister = useCallback(() => {
    controller.clearError("NO_PROFILE");
  }, []);

  function handleCenterMap() {
    if (cameraRef?.current) {
      const location = JSON.parse(storage.getString("user.location"), {});

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

  function handlePressDeclineNotice() {
    controller.clearError();
    const profile_id = storage.getString("user.profile_id");
    const profileString = storage.getString(`__tmp_profile.${profile_id}`);
    const profile = JSON.parse(profileString, {});

    router.navigate({
      pathname: "/register",
      params: {
        ...profile,
        id: storage.getString("user.profile_id"),
        status: "DECLINED",
      },
    });
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
        onCameraChanged={onCameraChanged}
        scaleBarEnabled={false}
        style={[styles.map, { opacity: isMapInitialized ? 1 : 0 }]}
        logoPosition={{ top: -100, left: 0 }}
        attributionEnabled={false}
        styleURL="mapbox://styles/mapbox/light-v11"
        // styleURL="mapbox://styles/mapbox/streets-v12"
      >
        <Mapbox.Camera
          centerCoordinate={[location.longitude, location.latitude]}
          followHeading={location.heading}
          heading={location.heading}
          key="static-camera"
          pitch={0}
          // pitch={40}
          ref={cameraRef}
          zoomLevel={15}
        />

        <Mapbox.Images
          images={{
            driverIcon,
            point,
            plate,
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

        {nearby?.map((trip) => (
          <TripMarker
            onPress={() => setSelected(trip.id)}
            key={trip.id}
            id={trip.id}
            created_at={trip.created_at}
            latitude={trip.latitude}
            longitude={trip.longitude}
          />
        ))}
      </Mapbox.MapView>

      <View style={{ position: "absolute", top: "0", width: "100%" }}>
        <View style={{ padding: 24, gap: 8 }}>
          <Optional condition={Boolean(tripRequest)}>
            <TouchableOpacity
              onPress={() => router.navigate({ pathname: "/(tabs)/trips" })}
            >
              <View style={{ backgroundColor: "white", padding: 16 }}>
                <Text>
                  You have ongoing trip request! Please acknowledge it before it
                  expires.
                </Text>
              </View>
            </TouchableOpacity>
          </Optional>

          <Optional condition={error === "PROFILE_DECLINED"}>
            <TouchableOpacity onPress={handlePressDeclineNotice}>
              <View style={{ backgroundColor: "white", padding: 16 }}>
                <Text>
                  Ang iyong profile ay na decline. I-update ang profile at
                  subukang i-submit ito ulit.
                </Text>
              </View>
            </TouchableOpacity>
          </Optional>

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
            <TouchableOpacity
              onPress={() => {
                router.navigate({ pathname: "/(tabs)/trips" });
                controller.clearError();
              }}
            >
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
          </View>
          <View style={styles.statusRow}>
            <Text
              style={{ minWidth: 210 }}
              textAlign="center"
              weight="bold"
              size={18}
              color="black"
            >
              <Optional condition={status === "ACTIVE"}>
                Handa nang bumiyahe
              </Optional>
              <Optional condition={status === "INACTIVE"}>
                Ikaw ay offline
              </Optional>
            </Text>
          </View>
        </View>
      </View>

      <Optional condition={selected}>
        <Preview id={selected} onClose={closePreview} onRegister={onRegister} />
      </Optional>

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
