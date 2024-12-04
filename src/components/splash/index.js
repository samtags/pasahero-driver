import { Dimensions, View } from "react-native";
import LottieView from "lottie-react-native";
import Text from "../text";

export default function SplashScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        height: Dimensions.get("window").height,
        width: Dimensions.get("window").width,
        zIndex: -10,
        backgroundColor: "white",
      }}
    >
      <LottieView
        autoPlay
        loop
        style={{
          width: 220,
          height: 220,
        }}
        source={require("../../assets/json/autocomplete-preloader.json")}
      />

      <View style={{ position: "absolute" }}>
        <Text textAlign="center" style={{ marginTop: 72 }}>
          Starting PasaHero Driver
        </Text>
      </View>
    </View>
  );
}
