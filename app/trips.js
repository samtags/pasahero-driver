import { Stack } from "expo-router";
import List from "@/src/screens/trips";
import Text from "@/src/components/text";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Trips
            </Text>
          ),
          headerTitleAlign: "center",
          headerTintColor: "#757477",
        }}
      />

      <List {...props} />
    </>
  );
}
