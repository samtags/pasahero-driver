import { Stack } from "expo-router";
import Answer from "@/src/screens/call/answer";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          headerBackVisible: false,
          animation: "none",
        }}
      />
      <Answer {...props} />
    </>
  );
}
