import { View, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMMKVString } from "react-native-mmkv";
import getColorByService from "@/src/services/util/colors/getColorByService";

export default function Center({ onPress }) {
  const [service] = useMMKVString("user.service");
  const [status] = useMMKVString("controller.status");

  let color = "#6366F1";

  if (status === "ACTIVE") {
    color = getColorByService(service);
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.iconCircle}>
        <Ionicons name="locate-sharp" size={32} color={color} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    backgroundColor: "white",
    height: 50,
    width: 50,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
});
