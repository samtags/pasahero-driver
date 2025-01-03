import { Stack } from "expo-router";
import Dial from "@/src/screens/call/dial";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          headerBackVisible: false,
        }}
      />
      <Dial {...props} />
    </>
  );
}
