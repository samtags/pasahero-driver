import { Stack } from "expo-router";
import Text from "@/src/components/text";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { call } from "@/src/services/images/remote";
import router, { useRouterParams } from "@/src/services/router";
import ChatScreen from "@/src/screens/chat";
import handleGetPlatformByService from "@/src/services/util/trip/handleGetPlatformByService";

export default function Entry(props) {
  const params = useRouterParams();

  // function handlePressCall() {
  //   router.navigate({
  //     pathname: "/call/dial",
  //     params: {
  //       roomId: params?.driver_id,
  //     },
  //   });
  // }

  let service = handleGetPlatformByService(params.service) || "";
  let driver = "";

  if (params?.first_name && params?.last_name) {
    driver = `- ${params?.first_name} ${params?.last_name}`;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              {service} {driver}
            </Text>
          ),
          headerTitleAlign: "center",
          // headerRight: () => (
          //   <TouchableOpacity onPress={handlePressCall}>
          //     <View style={styles.iconContainer}>
          //       <Image style={{ width: 22, height: 22 }} source={call} />
          //     </View>
          //   </TouchableOpacity>
          // ),
        }}
      />
      <ChatScreen />
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: "#EFEFEF",
    height: 40,
    width: 40,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
});
