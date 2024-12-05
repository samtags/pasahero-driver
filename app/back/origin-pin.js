import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import PinOrigin from "@/src/screens/pin/origin";
import PinProvider from "@/src/screens/pin/component/Provider";
import { useRouterParams } from "@/src/services/router";

export default function Entry() {
  const params = useRouterParams();

  const coordinates = {};
  if (params.latitude) coordinates.latitude = params.latitude;
  if (params.longitude) coordinates.longitude = params.longitude;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar backgroundColor="white" />
      <PinProvider {...coordinates}>
        <PinOrigin />
      </PinProvider>
    </>
  );
}
