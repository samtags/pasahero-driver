import "react-native-gesture-handler";
import "react-native-reanimated";
import { Stack } from "expo-router/stack";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import * as WebBrowser from "expo-web-browser";
import { LogBox } from "react-native";
import Mapbox from "@rnmapbox/maps";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkProvider, ClerkLoaded, ClerkLoading } from "@clerk/clerk-expo";
import { UNSAFE_registerProperty } from "@/src/services/global";
import { useWarmUpBrowser } from "@/src/services/hooks/useWarmUpBrowser";
import { useStorageLifecycle } from "@/src/services/storage";
import onFetchUpdateAsync from "@/src/services/updates";
import useWillEffect from "@/src/services/hooks/useWillEffect";
import ImagePreRenderer from "@/src/services/images/PreRenderer";
import GrowthBook from "@/src/services/growthbook";
import tokenCache from "@/src/services/auth/tokenCache";
import SplashScreen from "@/src/components/splash";
import OAuthProvider from "@/src/services/auth/useOAuth";
import useSupply from "@/src/services/background/supply";
import useLocation from "@/src/services/background/location";
import useSubscribeToIncomingTrip from "@/src/services/trip/incoming";
import { useMMKVString } from "react-native-mmkv";
import usePushNotification from "@/src/services/notification/usePushNotification";
import useIncomingCall from "@/src/services/hooks/useIncomingCall";
import { BrookProvider } from "@aptly-sdk/brook/react";
import { client } from "@/src/services/aptly/client";

// Ignore log notification by message
LogBox.ignoreLogs(["Warning: ..."]);

//Ignore all log notifications
LogBox.ignoreAllLogs();

Notifications.setNotificationHandler({
  handleNotification: () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

WebBrowser.maybeCompleteAuthSession();
Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_KEY);
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const queryClient = new QueryClient({});
UNSAFE_registerProperty("__queryClient__", queryClient);

export default function App() {
  return (
    <BrookProvider config={client}>
      <Layout />
    </BrookProvider>
  );
}

export function Layout() {
  const [isSignedIn] = useMMKVString("user.id");

  useWillEffect(() => {
    // check for codepush updates
    onFetchUpdateAsync();
  }, []);

  useSupply();
  useLocation();
  useWarmUpBrowser();
  useStorageLifecycle();
  useSubscribeToIncomingTrip();
  usePushNotification();
  useIncomingCall();

  useFonts({
    "Lato-Thin": require("../assets/fonts/Lato/Lato-Thin.ttf"),
    "Lato-Light": require("../assets/fonts/Lato/Lato-Light.ttf"),
    "Lato-Regular": require("../assets/fonts/Lato/Lato-Regular.ttf"),
    "Lato-Bold": require("../assets/fonts/Lato/Lato-Bold.ttf"),
    "Lato-Black": require("../assets/fonts/Lato/Lato-Black.ttf"),
  });

  let stack = (
    <>
      <ClerkLoading>
        <SplashScreen />
      </ClerkLoading>

      <ClerkLoaded>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ClerkLoaded>
    </>
  );

  if (isSignedIn) {
    stack = (
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <>
      <ImagePreRenderer />
      <QueryClientProvider client={queryClient}>
        <GrowthBook>
          <GestureHandlerRootView style={styles.gesture}>
            <ClerkProvider
              tokenCache={tokenCache}
              publishableKey={publishableKey}
            >
              <OAuthProvider>{stack}</OAuthProvider>
            </ClerkProvider>
          </GestureHandlerRootView>
        </GrowthBook>
      </QueryClientProvider>
    </>
  );
}

const styles = {
  gesture: {
    flex: 1,
  },
};
