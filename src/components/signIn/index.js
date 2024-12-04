import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { SignedOut, useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from "../../services/hooks/useWarmUpBrowser";
import log from "../../services/log";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  useWarmUpBrowser();

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleSignInViaGoogle = async () => {
    try {
      const flow = await startOAuthFlow();

      const { createdSessionId, signUp, setActive } = flow;

      if (createdSessionId) {
        setActive({ session: createdSessionId });
      } else {
        setActive({ session: signUp.createdSessionId });
      }
    } catch (err) {
      log.error("OAuth error", { error: err });
    }
  };

  return (
    <SignedOut>
      <View style={styles.container}>
        <SafeAreaView>
          <TouchableOpacity onPress={handleSignInViaGoogle}>
            <Text style={styles.underlined}>Sign in via Google</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </SignedOut>
  );
}

const styles = StyleSheet.create({
  underlined: {
    color: "#38434D",
    textDecorationLine: "underline",
    marginTop: 16,
    fontWeight: "700",
  },
  container: {
    position: "absolute",
    bottom: 0,
    zIndex: 1,
    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "gainsboro",
  },
});
