import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { phoneIconEnd } from "@/src/services/images/remote";
import Text from "@/src/components/text";

export default function Drop({ onPress, label }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.button}>
          <Image source={phoneIconEnd} style={{ width: 36, height: 36 }} />
        </View>
        <Text color="#fff">{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  button: {
    width: 80,
    height: 80,
    backgroundColor: "#FB3C2D",
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
});
