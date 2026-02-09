import { Stack, useRouter } from "expo-router";
import { View, SafeAreaView, StyleSheet } from "react-native";
import Text from "../../components/text";
import Mapbox from "@rnmapbox/maps";
import Cta from "../../components/cta";
import { Image } from "expo-image";
import { gettingStarted } from "../../services/images/remote";
import router from "../../services/router";

export default function GettingStarted() {
  const handleGetStarted = () => {
    router.navigate({ pathname: "setup" });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={styles.full}>
        <View style={styles.absolute}>
          <View style={styles.content}>
            <Image
              style={styles.image}
              source={gettingStarted}
              transition={500}
            />
            <Text textAlign="center" size={28} weight="bold" color="#353579">
              Setup your initial location
            </Text>
            <View />
            <View style={{ alignItems: "center" }}>
              <Text maxWidth={310} textAlign="center" size={18} color="#B9B8BB">
                Let's set your initial location. You can change it later on.
              </Text>
            </View>
            <View style={{ marginTop: 92 }} />
            <Cta onPress={handleGetStarted} color="#6366F1">
              Get Started
            </Cta>
          </View>
        </View>
        <Mapbox.MapView
          scaleBarEnabled={false}
          style={styles.map}
          // styleURL="mapbox://styles/mapbox/streets-v12"
          styleURL="mapbox://styles/mapbox/light-v11"
          logoPosition={{ top: -100, left: 0 }}
          attributionEnabled={false}
        >
          <Mapbox.Camera
            animationMode="none"
            zoomLevel={13.79}
            centerCoordinate={[120.9840517, 14.6052175]}
          />
        </Mapbox.MapView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  full: {
    flex: 1,
    position: "relative",
  },
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
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
    paddingBottom: 18,
    paddingTop: 32,
    gap: 16,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  image: {
    width: 156,
    height: 131,
    transform: "rotate(15deg)",
    alignSelf: "center",
  },
});
