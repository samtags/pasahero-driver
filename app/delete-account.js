import { Stack } from "expo-router";
import { WebView } from "react-native-webview";
import { StyleSheet, View } from "react-native";
import Text from "../src/components/text";
import { useState } from "react";
import Optional from "../src/components/optional";
import LottieView from "lottie-react-native";
import { useMMKVString } from "react-native-mmkv";

export default function Entry(props) {
  const [showWebview, setShowWebView] = useState(false);
  const [email] = useMMKVString("user.email");

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Delete Account
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
              source={require("@/src/assets/json/autocomplete-preloader.json")}
            />
          </View>
        </Optional>
        <WebView
          onLoadEnd={() => {
            setShowWebView(true);
          }}
          style={[styles.container, { opacity: showWebview ? 1 : 0 }]}
          source={{
            uri: `https://app.nocodb.com/#/nc/form/14d948eb-24b6-48bd-87df-69a82bddafad?Email=${email}`,
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
