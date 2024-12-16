import { Stack } from "expo-router";
import {
  Text as RNText,
  Linking,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import Text from "@/src/components/text";
import { useMMKVString } from "react-native-mmkv";
import { feedback } from "@/src/services/images/remote";

export default function Entry() {
  const [email] = useMMKVString("user.email");

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Contact Us
            </Text>
          ),
          headerTitleAlign: "center",
          headerTintColor: "#757477",
        }}
      />

      <View style={{ backgroundColor: "white", height: "100%", padding: 16 }}>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              `https://app.nocodb.com/#/nc/form/82d6cbfe-23c4-43ab-92a0-eedf31b4f62f?Email=${
                email ?? ""
              }`
            )
          }
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Image source={feedback} style={{ width: 44, height: 44 }} />
            <Text>Share us your feedback</Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
}
