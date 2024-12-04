import { View, SafeAreaView, StyleSheet, TouchableOpacity } from "react-native";
import Mapbox from "@rnmapbox/maps";
import Text from "@/src/components/text";
import { useRef, useState } from "react";
import { useUser as useUsr } from "@clerk/clerk-expo";
import { useMMKVString } from "react-native-mmkv";
import Transit from "@/src/components/locations/Transit";
import { Image } from "expo-image";
import Optional from "@/src/components/optional";
import { IfFeatureEnabled } from "@growthbook/growthbook-react";
import router from "@/src/services/router";
import MatchPromo from "./components/promo";
import DriverDisplay from "./components/driver";
import DisplayLocation from "./components/user";
import useOnUpdate from "@/src/services/hooks/useOnUpdate";
import useTrips, { resetTrips } from "@/src/services/queries/useTrips";
import useOnFocus from "@/src/services/hooks/useOnFocus";
import log from "@/src/services/log";
import useIncomingCall from "@/src//services/hooks/useIncomingCall";
import usePushNotification from "@/src//services/notification/usePushNotification";
import storage from "@/src/services/storage";
import useGetDrivers from "@/src/services/hooks/useGetDrivers";
import useThrottledValue from "@/src/services/hooks/useThrottleValue";
import {
  account,
  motorAngkasIcon,
  currentLocationIndicator,
  ongoing,
} from "@/src/services/images/remote";
import updateUser from "@/src/services/api/updateUser";

export default function Home() {
  let greeting = "Hi,";

  const user = useUser();
  const cameraRef = useRef(null);
  const [center, setCenter] = useState(undefined);
  const [loc] = useMMKVString("location.current");
  const location = JSON.parse(loc, {});
  const { data: trips = [] } = useTrips();
  const { latitude, longitude } = useThrottledValue(center || location, 1500);
  const nearbyDriverSubscriptionKeys = useGetDrivers(latitude, longitude);

  usePushNotification(user?.id);
  useIncomingCall(user?.id);

  useOnFocus(() => {
    log.debug("User is in the home screen.");
    resetTrips();
  }, []);

  if (user?.firstName) greeting = `Hi ${user.firstName}!`;

  function handleRecenterMap() {
    if (cameraRef?.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [location.longitude, location.latitude],
        animationMode: "flyTo",
      });
    }
  }

  function handleOnPressWhereTo() {
    handleInitializeDraft();
    router.navigate({ pathname: "/destination" });
  }

  function onCameraChange(camera) {
    const latitude = camera.properties.center[1];
    const longitude = camera.properties.center[0];

    setCenter({ latitude, longitude });
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.full}>
        <View pointerEvents="box-none" style={styles.absolute}>
          <View style={styles.widgetContainer}>
            <View>
              <IfFeatureEnabled feature="passenger-ongoing-trip-indicator">
                <Optional condition={trips?.length > 0}>
                  <TouchableOpacity
                    onPress={router.navigate.bind(null, {
                      pathname: "/trips",
                    })}
                  >
                    <View style={styles.ongoingTripIcon}>
                      <View style={{ width: 63, height: 63 }}>
                        <Image
                          style={{ width: "100%", height: "100%" }}
                          cachePolicy="memory-disk"
                          contentFit="contain"
                          source={ongoing}
                        />
                        <View style={styles.badge}>
                          <Text size={12} color="white">
                            {trips.length}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Optional>
              </IfFeatureEnabled>
            </View>
            <TouchableOpacity onPress={handleRecenterMap}>
              <Image
                style={{ width: 60, height: 60 }}
                cachePolicy="memory-disk"
                source={center}
              />
            </TouchableOpacity>
          </View>

          <IfFeatureEnabled feature="home-driver-count-promotion">
            <Optional condition={nearbyDriverSubscriptionKeys.length > 0}>
              <MatchPromo
                onPress={handleOnPressWhereTo}
                count={nearbyDriverSubscriptionKeys.length}
              />
            </Optional>
          </IfFeatureEnabled>

          <View style={styles.content}>
            <Text size={18} weight="bold" color="#757477">
              {greeting}
            </Text>
            <Text size={28} weight="bold" color="#353579">
              Where are we going?
            </Text>
            <View style={styles.heading}>
              <Transit onPress={handleOnPressWhereTo}>Going to?</Transit>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={router.navigate.bind(null, { pathname: "/account" })}
          style={styles.accountIcon}
        >
          <Image
            style={{ width: 60, height: 60 }}
            cachePolicy="memory-disk"
            source={account}
          />
        </TouchableOpacity>

        <Mapbox.MapView
          onCameraChanged={onCameraChange}
          // onRegionDidChange={onRegionDidChange}
          scaleBarEnabled={false}
          style={styles.map}
          styleURL="mapbox://styles/mapbox/streets-v12"
          logoPosition={{ top: -100, left: 0 }}
          attributionEnabled={false}
        >
          <Mapbox.Images
            images={{
              Angkas: motorAngkasIcon,
              currentLocationIndicator,
            }}
          />

          <Mapbox.Camera
            ref={cameraRef}
            animationMode="none"
            zoomLevel={14.75}
            pitch={30}
            centerCoordinate={[location.longitude, location.latitude]}
          />
          <DriverDisplay subscriptionKeys={nearbyDriverSubscriptionKeys} />

          <DisplayLocation
            latitude={location.latitude}
            longitude={location.longitude}
          />
        </Mapbox.MapView>
      </SafeAreaView>
    </View>
  );
}

function useUser() {
  const user = useUsr();
  const [id] = useMMKVString("user.id");
  const [name] = useMMKVString("user.name");

  useOnUpdate(() => {
    if (user?.user) {
      handleInitializeUser(user.user);
    }
  }, [user?.user]);

  return { id, name, firstName: user?.user?.firstName };
}

function handleInitializeUser(userInfo) {
  log.debug("Initializing user data.", { userInfo });

  if (userInfo) {
    const id = userInfo.id;
    const name = userInfo.fullName;
    const firstName = userInfo.firstName;
    const lastName = userInfo.lastName;
    const imageUrl = userInfo.imageUrl;
    const email = userInfo.primaryEmailAddress?.emailAddress;

    log.debug("Storing user data to state.", { userInfo, id, name, firstName, lastName, imageUrl, email }); // prettier-ignore

    if (id) storage.set("user.id", id);
    if (name) storage.set("user.name", name);
    if (firstName) storage.set("user.firstName", firstName);
    if (lastName) storage.set("user.lastName", lastName);
    if (imageUrl) storage.set("user.imageUrl", imageUrl);
    if (email) storage.set("user.email", email);

    updateUser({ id, image_url: imageUrl, name });
  }
}

function handleInitializeDraft() {
  const currentLocation = storage.getString("location.current");
  const location = JSON.parse(currentLocation);

  const draft = {
    first: {
      latitude: location.latitude,
      longitude: location.longitude,
      shortAddress: location.shortAddress,
      longAddress: location.longAddress,
    },
    last: {},
  };

  log.debug("User initialized draft", { ["trip.draft"]: draft });
  storage.set("trip.draft", JSON.stringify(draft));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  full: {
    flex: 1,
    position: "relative",
  },
  absolute: {
    position: "absolute",
    zIndex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingVertical: 32,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  heading: {
    flexDirection: "row",
    marginTop: 16,
  },
  accountIcon: {
    position: "absolute",
    zIndex: 1,
    padding: 16,
    paddingTop: 40,
  },
  ongoingTripIcon: {
    position: "relative",
    zIndex: 1,
  },
  badge: {
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    width: 20,
    borderRadius: 20,
    height: 20,
    position: "absolute",
    top: 0,
    right: 0,
  },
  widgetContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
});
