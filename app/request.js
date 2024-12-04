import { CommonActions, StackActions } from "@react-navigation/native";
import { Stack, useNavigation } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from "@/src/services/hooks/useWarmUpBrowser";
import RequestScreen from "@/src/screens/request";
import Text from "@/src/components/text";
import { HeaderBackButton } from "@react-navigation/elements";
import { Alert, View } from "react-native";
import { useRouterParams } from "@/src/services/router";
import router from "@/src/services/router";

WebBrowser.maybeCompleteAuthSession();

export default function Request() {
  const params = useRouterParams();
  const navigation = useNavigation();

  useWarmUpBrowser();

  function handlePressBack() {
    Alert.alert("Discard request?", "Do you want to discard this request?", [
      { text: "Cancel", style: "cancel", onPress: () => {} },
      {
        text: "OK",
        style: "default",
        onPress: () => {
          if (params?.from) {
            return router.replace({ pathname: params.from });
          }

          navigation.dispatch(
            CommonActions.reset({
              routes: [{ name: "index" }],
              index: 0,
            })
          );
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Request Ride
            </Text>
          ),
          headerTitleAlign: "center",
          headerTintColor: "#757477",
          headerBackVisible: false,
          headerLeft: (props) => (
            <View style={{ marginLeft: -12 }}>
              <HeaderBackButton {...props} onPress={handlePressBack} />
            </View>
          ),
        }}
      />
      <RequestScreen />
    </>
  );
}
