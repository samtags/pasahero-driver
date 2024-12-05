import { StyleSheet, View, TouchableOpacity } from "react-native";
import Mapbox from "@rnmapbox/maps";
import Text from "@/src/components/text";
import Ionicons from "@expo/vector-icons/Ionicons";

const defaultCenterCoordinate = [120.9763782, 14.5869407];

export default function Home() {
  const isMapInitialized = true;

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
          <TouchableOpacity>
            <View style={{ backgroundColor: "white", padding: 16 }}>
              <Text>
                Paumanhin pero mayroon kapang ongoing na trip. I-complete muna
                ang trip upang makapag patuloy.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <View style={{ backgroundColor: "white", padding: 16 }}>
              <Text>
                Hindi na sapat ang iyong wallet. Mag top-up na upang makatanggap
                ng bagong trips.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity>
            <View style={{ backgroundColor: "white", padding: 16 }}>
              <Text>
                Ni-rerequire namin ang location permission. Mangyaring i-set ito
                "Allow all the time" upang makapag patuloy.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ position: "absolute", bottom: "0", width: "100%" }}>
        <View
          style={{
            padding: 16,
            paddingVertical: 8,
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <TouchableOpacity>
            <View
              style={{
                backgroundColor: "white",
                height: 50,
                width: 50,
                borderRadius: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="locate-sharp" size={32} color="#6366F1" />
            </View>
          </TouchableOpacity>
        </View>
        <View
          style={{
            backgroundColor: "white",
            padding: 24,
            paddingTop: 0,
            position: "relative",
            gap: 16,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <TouchableOpacity
              style={{
                marginTop: -37.5,
              }}
            >
              <View
                style={{
                  backgroundColor: "#6366F1",
                  height: 75,
                  width: 75,
                  borderRadius: 75,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* <Ionicons name="power-outline" size={32} color="white" /> */}
                <Ionicons name="stop" size={32} color="white" />
              </View>
            </TouchableOpacity>
          </View>
          <Text textAlign="center" size={18}>
            You are offline
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
});
