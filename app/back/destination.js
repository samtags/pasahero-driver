import { Stack, useNavigation } from "expo-router";
import Text from "@/src/components/text";
import { useEffect } from "react";
import log from "@/src/services/log";
import DestinationScreen from "@/src/screens/destination";

export default function Destination() {
  const navigation = useNavigation();

  useEffect(() => {
    function handleBeforeRemove(e) {
      if (e.data.action.type === "POP") {
        log.debug("User cancel search from select destination.");
      }
    }

    navigation.addListener("beforeRemove", handleBeforeRemove);

    return () => {
      navigation.removeListener("beforeRemove", handleBeforeRemove);
    };
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Going to?
            </Text>
          ),
          headerTitleAlign: "center",
          headerTintColor: "#757477",
        }}
      />
      <DestinationScreen />
    </>
  );
}
