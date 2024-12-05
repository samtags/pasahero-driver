import { Stack } from "expo-router";
import Text from "@/src/components/text";
import OriginScreen from "@/src/screens/origin";

export default function Origin() {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Meet you at?
            </Text>
          ),
          headerTitleAlign: "center",
        }}
      />
      <OriginScreen />
    </>
  );
}
