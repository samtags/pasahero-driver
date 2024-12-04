import { StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "../text";
import { Image } from "expo-image";
import { to } from "../../services/images/remote";

/**
 *
 * @param {Props} props
 * @returns
 */
export default function Transit({ onPress, children, indicatorSrc, color }) {
  let indicator = to;

  if (indicatorSrc) {
    indicator = indicatorSrc;
  }

  return (
    <TouchableOpacity style={styles.button} onPress={() => onPress?.()}>
      <View style={styles.container}>
        <Image
          style={styles.indicator}
          cachePolicy="memory-disk"
          source={indicator}
        />
        <Text
          size={18}
          numberOfLines={1}
          color={color || "#B9B8BB"}
          weight="bold"
        >
          {children}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { flex: 1 },
  container: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 16,
    paddingRight: 24,
    paddingVertical: 14,
    flexDirection: "row",
    borderRadius: 10,
    alignItems: "center",
    gap: 8,
  },
  indicator: { width: 14, height: 14 },
});

/**
 * @typedef Props
 * @property {() => unknown} onPress
 * @property {string} children
 * @property {string} [indicatorSrc]
 * @property {string} [color]
 */
