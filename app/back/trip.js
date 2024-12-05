import { Stack } from "expo-router";
import Trip from "@/src/screens/trip";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <Trip {...props} />
    </>
  );
}
