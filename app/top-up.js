import { Stack } from "expo-router";
import Text from "@/src/components/text";
import TopUpScreen from "@/src/screens/top-up";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold">
              Top-up Request
            </Text>
          ),
          headerTintColor: "#757477",
        }}
      />
      <TopUpScreen {...props} />
    </>
  );
}
