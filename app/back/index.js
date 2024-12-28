import { Stack } from "expo-router";
import { useMMKVString, useMMKVBoolean } from "react-native-mmkv";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import GettingStarted from "@/src/screens/getting-started";
import Home from "@/src/screens/home";
import Maintenance from "@/src/screens/maintenance";
import Update from "@/src/screens/update";

export default function App() {
  const [location] = useMMKVString("location.current");
  const [updateAvailable] = useMMKVBoolean("app.updateAvailable");
  const isMaintenance = useFeatureIsOn("phd-show-maintenance", false);
  const showForceUpdate = useFeatureIsOn("phd-show-force-update", false);

  if (!location) return <GettingStarted />;

  if (isMaintenance) return <Maintenance />;
  if (showForceUpdate || updateAvailable) return <Update />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Home />
    </>
  );
}
