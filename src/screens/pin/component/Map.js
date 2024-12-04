import { View, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import Mapbox from "@rnmapbox/maps";
import { pin } from "@/src/services/images/remote";
import { Context } from "./Provider";
import Optional from "@/src/components/optional";
import { useContext, useEffect } from "react";
import log from "@/src/services/log";

export default function Map() {
  const {
    isKeyboardVisible,
    cameraRef,
    isMapLoading,
    handleSwipeMapStart,
    setMapCoordinates,
    defaultLatitude,
    defaultLongitude,
  } = useContext(Context);

  const containerOptionalStyles = {};

  if (isMapLoading) {
    containerOptionalStyles.opacity = 0;
  }

  const handleOnChangeRegion = (e) => {
    setMapCoordinates({
      latitude: e.properties.center[1],
      longitude: e.properties.center[0],
    });
  };

  useEffect(() => {
    log.debug("Map component rendered.");
  }, []);

  return (
    <View style={[styles.container, containerOptionalStyles]}>
      <Optional condition={isKeyboardVisible === false}>
        <View pointerEvents="none" style={styles.marker}>
          <Image style={styles.pin} source={pin} contentFit="contain" />
        </View>
      </Optional>
      <Mapbox.MapView
        style={styles.map}
        scaleBarEnabled={false}
        logoPosition={{ top: -100, left: 0 }}
        attributionEnabled={false}
        onTouchStart={(e) => handleSwipeMapStart?.(e)}
        onCameraChanged={(e) => handleOnChangeRegion?.(e)}
        styleURL="mapbox://styles/mapbox/streets-v12"
      >
        <Mapbox.Camera
          ref={cameraRef}
          animationMode="none"
          zoomLevel={16.344}
          centerCoordinate={[defaultLongitude, defaultLatitude]}
        />
      </Mapbox.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  marker: {
    position: "absolute",
    zIndex: 1,
    alignItems: "center",
    gap: 2,
  },
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
    position: "relative",
  },
  container: {
    flex: 1,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    zIndex: 0,
  },
  pin: { height: 98, width: 98, marginTop: -50 },
});
