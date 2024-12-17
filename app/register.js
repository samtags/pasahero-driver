import { Stack } from "expo-router";
import Text from "@/src/components/text";
import { useRouterParams } from "@/src/services/router";
import RegisterProfile from "@/src/screens/register";
import handleGetPlatformByService from "@/src/services/util/trip/handleGetPlatformByService";
import { useMMKVString } from "react-native-mmkv";

export default function Entry() {
  const [service] = useMMKVString("user.service");

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Register {handleGetPlatformByService(service)} Profile
            </Text>
          ),
          headerTintColor: "#757477",
        }}
      />
      <RegisterProfile />
    </>
  );
}
