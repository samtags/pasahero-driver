import { Stack } from "expo-router";
import { WebView } from "react-native-webview";
import { StyleSheet, View } from "react-native";
import Text from "@/src/components/text";
import { useState } from "react";
import Optional from "@/src/components/optional";
import LottieView from "lottie-react-native";

export default function Entry() {
  const [showWebview, setShowWebView] = useState(false);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Submit Profile Guide
            </Text>
          ),
          headerTitleAlign: "center",
          headerTintColor: "#757477",
          animation: "ios",
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
              source={require("@/src/assets/json/autocomplete-preloader.json")}
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
            uri: `https://pasahero.notion.site/Profile-Review-Guideline-3b591a2878c44928a7a4afd984173a4f?pvs=74`,
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: -60,
  },
});
