import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useIncomingRequest } from "@/src/screens/trips";
import { useMMKVObject } from "react-native-mmkv";

export default function TabLayout() {
  const request = useIncomingRequest();
  const [activeTrip] = useMMKVObject("__tmp_trip.active");

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
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="layers-outline" color={color} />
          ),
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
