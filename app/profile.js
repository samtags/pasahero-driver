import { Stack } from "expo-router";
import Text from "@/src/components/text";
import ProfileScreen from "@/src/screens/profile";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold">
              Profiles
            </Text>
          ),
          headerTintColor: "#757477",
        }}
      />
      <ProfileScreen {...props} />
    </>
  );
}
