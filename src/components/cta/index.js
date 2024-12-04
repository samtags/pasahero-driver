import { StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "../text";

/**
 *
 * @param {Props} props
 * @returns
 */
export default function cta({
  label,
  color = "#D1D5DB",
  textColor,
  children,
  onPress,
  disabled,
  style = {},
}) {
  return (
    <TouchableOpacity disabled={disabled} onPress={() => onPress?.()}>
      <View style={[styles.container, { backgroundColor: color }, style]}>
        <Text
          size={18}
          weight="bold"
          textAlign="center"
          color={textColor || "white"}
        >
          {children || label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 17.5,
  },
});

/**
 * @typedef Props
 * @property {string} [label]
 * @property {string} [color]
 * @property {string} [textColor]
 * @property {React.ReactNode | string} [children]
 * @property {() => void} [onPress]
 * @property {boolean} [disabled]
 */
