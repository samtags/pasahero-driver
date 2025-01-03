import { Stack } from "expo-router";
import Ring from "@/src/screens/call/ring";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          headerBackVisible: false,
        }}
      />
      <Ring {...props} />
    </>
  );
}
