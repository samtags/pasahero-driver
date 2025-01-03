import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { speakerIcon } from "../../../services/images/remote";
import Text from "../../../components/text";

export default function Speaker({ isActive, onPress, label }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <View style={[styles.button, isActive && styles.activeContainer]}>
          <Image
            source={speakerIcon}
            style={[styles.image, isActive && styles.activeImage]}
          />
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
    backgroundColor: "#454C50",
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 36,
    height: 36,
  },
  activeContainer: {
    backgroundColor: "#fff",
  },
  activeImage: {
    tintColor: "#000",
  },
});
