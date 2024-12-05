import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import router from "@/src/services/router";

export default function Callback() {
  useEffect(() => {
    router.back();
  }, []);

  return (
    <Stack.Screen
      options={{
        headerShown: false,
      }}
    />
  );
}
