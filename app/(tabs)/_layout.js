import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useIncomingRequest } from "@/src/screens/trips";
import { useMMKVObject, useMMKVBoolean } from "react-native-mmkv";
import Maintenance from "@/src/screens/maintenance";
import Update from "@/src/screens/update";
import { useFeatureIsOn } from "@growthbook/growthbook-react";

export default function TabLayout() {
  const request = useIncomingRequest();
  const [activeTrip] = useMMKVObject("__tmp_trip.active");

  const isMaintenance = useFeatureIsOn("phd-show-maintenance", false);
  const showForceUpdate = useFeatureIsOn("phd-show-force-update", false);
  const showWallet = useFeatureIsOn("phd-enable-wallet", false);
  const [updateAvailable] = useMMKVBoolean("app.updateAvailable");

  if (isMaintenance) return <Maintenance />;
  if (showForceUpdate || updateAvailable) return <Update />;

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#363F59" }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="home-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Jobs",
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="at-outline" color={color} />
          ),
          tabBarBadge: activeTrip || request ? 1 : undefined,
          tabBarBadgeStyle: {
            fontFamily: "Lato-Bold",
            fontSize: 10,
            backgroundColor: "#EF4444",
          },
          lazy: false,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="layers-outline" color={color} />
          ),
          lazy: false,
          href: showWallet ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="settings-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
