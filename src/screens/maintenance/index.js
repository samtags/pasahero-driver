import { View } from "react-native";
import Text from "../../components/text";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function Maintenance() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <StatusBar />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "white",
          padding: 24,
          gap: 4,
        }}
      >
        <Text size={32} color="#1B1B1B">
          Maintenance
        </Text>
        <Text style={{ maxWidth: 380 }} textAlign="justified" color="#707070">
          ˈmeɪn·tən·əns
        </Text>

        <View style={{ marginTop: 8 }} />

        <Text style={{ maxWidth: 380 }} textAlign="justified" color="#707070">
          the process of maintaining or preserving someone or something, or the
          state of being maintained.
        </Text>
      </View>
    </>
  );
}
