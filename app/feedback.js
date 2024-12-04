import { Stack } from "expo-router";
import { WebView } from "react-native-webview";
import { StyleSheet, View } from "react-native";
import Text from "../src/components/text";
import { useState } from "react";
import Optional from "../src/components/optional";
import LottieView from "lottie-react-native";
import { useUser } from "@clerk/clerk-expo";

export default function Entry(props) {
  const [showWebview, setShowWebView] = useState(false);
  const { user } = useUser();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Feedback
            </Text>
          ),
          headerTitleAlign: "center",
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
            setShowWebView(true);
          }}
          style={[styles.container, { opacity: showWebview ? 1 : 0 }]}
          source={{
            uri: `https://airtable.com/appXQd7rSsw0l222y/shrL4mayOt6R1EdKp?prefill_Email=${
              user?.primaryEmailAddress?.emailAddress ?? ""
            }`,
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
