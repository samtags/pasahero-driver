import { Stack } from "expo-router";
import Text from "@/src/components/text";
import { useRouterParams } from "@/src/services/router";
import RegisterProfile from "@/src/screens/register";
import handleGetPlatformByService from "@/src/services/util/trip/handleGetPlatformByService";
import { useMMKVString } from "react-native-mmkv";

export default function Entry() {
  const [service] = useMMKVString("user.service");
  const params = useRouterParams();

  const status = params?.status;
  const platform = handleGetPlatformByService(service);

  let title = "Profile";
  if (platform) title = `${platform} Profile`;

  if (!status || status === "DRAFT") {
    title = `Register ${platform} Profile`;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              {title}
            </Text>
          ),
          headerTintColor: "#757477",
        }}
      />
      <RegisterProfile />
    </>
  );
}
