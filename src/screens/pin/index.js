import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useState, useRef } from "react";
import reverseGeocode from "../../services/api/reverseGeocoding";
import { Image } from "expo-image";
import Mapbox from "@rnmapbox/maps";
import { pinWhite } from "../../services/images/remote";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY);

export default function Pin() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const mapRef = useRef(null);

  const [center, setCenter] = useState({
    latitude: params.latitude,
    longitude: params.longitude,
  });

  async function handleConfirm() {
    const redirectSource = params.redirectSource;

    // query reverse geocoding API
    const result = await reverseGeocode(
      `${center.latitude},${center.longitude}`
    );

    if (result.data.status === "OK") {
      if (result?.data?.results?.[0]) {
        const placeId = data?.place_id;
        const address = data?.formatted_address;

        router.back();
        router.setParams({
          // first.ChIJETKun6zAlzMRxwiz-19C__Z.latitude
          [`${redirectSource}.${placeId}.latitude`]: center?.latitude,
          [`${redirectSource}.${placeId}.longitude`]: center?.longitude,
          [`${redirectSource}.placeId`]: placeId,
          [`${redirectSource}.address`]: address,
          // todo: change this to the real short address value
          [`${redirectSource}.short_address`]: address,
        });
      }
    }
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            position: "relative",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View style={styles.marker}>
            <Image
              style={{ height: 56, width: 56 }}
              source={pinWhite}
              contentFit="cover"
            />
          </View>
          <Mapbox.MapView
            ref={mapRef}
            onCameraChanged={(e) => {
              const latitude = e.properties.center[1];
              const longitude = e.properties.center[0];

              setCenter({
                latitude,
                longitude,
              });
            }}
            style={styles.map}
            logoPosition={{ top: -100, left: 0 }}
            scaleBarEnabled={false}
          >
            <Mapbox.Camera
              animationMode="none"
              zoomLevel={15}
              centerCoordinate={[params.longitude, params.latitude]}
            />
          </Mapbox.MapView>
        </View>
        <TouchableOpacity onPress={handleConfirm} style={styles.primary}>
          <Text>Confirm</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "whitesmoke",
  },
  primary: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flexShrink: 0,
  },
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  pin: {
    backgroundColor: "gainsboro",
    height: 24,
    width: 24,
    borderRadius: 4,
  },
  marker: {
    position: "absolute",
    zIndex: 1,
    alignItems: "center",
    gap: 2,
  },
});
