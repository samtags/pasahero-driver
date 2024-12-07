import { Stack } from "expo-router";
import Text from "@/src/components/text";
import { useRouterParams } from "@/src/services/router";
import handleGetPlatformByService from "@/src/services/util/trip/handleGetPlatformByService";
import RegisterProfile from "@/src/screens/register";

export default function Entry() {
  const params = useRouterParams();
  const service = handleGetPlatformByService(params?.service);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Register Profile
            </Text>
          ),
          headerTitleAlign: "center",
          headerTintColor: "#757477",
        }}
      />
      <RegisterProfile />
    </>
  );
}
