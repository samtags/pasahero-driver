import { Stack } from "expo-router";
import { WebView } from "react-native-webview";
import { StyleSheet, View } from "react-native";
import Text from "@/src/components/text";
import { useState } from "react";
import Optional from "@/src/components/optional";
import LottieView from "lottie-react-native";

export default function Entry(props) {
  const [showWebview, setShowWebView] = useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold">
              Privacy Policy
            </Text>
          ),
          headerTintColor: "#757477",
        }}
      />

      <View style={{ backgroundColor: "white", height: "100%" }}>
        <Optional condition={showWebview === false}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <LottieView
              autoPlay
              loop
              style={{
                width: 220,
                height: 220,
                marginTop: -64,
                marginBottom: -88,
              }}
              source={require("../src/assets/json/autocomplete-preloader.json")}
            />
          </View>
        </Optional>
        <WebView
          onLoadEnd={() => {
            setTimeout(() => {
              setShowWebView(true);
            }, 500);
          }}
          style={[styles.container, { opacity: showWebview ? 1 : 0 }]}
          source={{
            uri: "https://pasahero.notion.site/Privacy-Policy-8509d15dfd6749b696ca624b857c203e?pvs=74",
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: -120,
  },
});
