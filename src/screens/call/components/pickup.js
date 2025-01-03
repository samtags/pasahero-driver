import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { phoneIconAnswer } from "../../../services/images/remote";
import Text from "../../../components/text";

export default function Pickup({ onPress, label }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <View style={styles.button}>
          <Image source={phoneIconAnswer} style={{ width: 36, height: 36 }} />
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
    backgroundColor: "#41D955",
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
});
