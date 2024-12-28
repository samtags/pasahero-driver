import { Text as RNText, StyleSheet } from "react-native";

/**
 *
 * @param {Props} props
 */
export default function Text({
  weight = "normal",
  children, //
  style = {},
  size = 16,
  color = "#000",
  textAlign,
  maxWidth,
  numberOfLines,
}) {
  const defaultStyles = {
    fontSize: size,
    lineHeight: size,
    color,
  };

  if (maxWidth) {
    defaultStyles.maxWidth = maxWidth;
  }

  if (textAlign) {
    defaultStyles.textAlign = textAlign;
  }

  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[styles.default, defaultStyles, styles[weight], style]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: "Lato-Regular",
  },
  normal: {
    fontFamily: "Lato-Regular",
  },
  bold: {
    fontFamily: "Lato-Bold",
  },
  100: {
    fontFamily: "Lato-Thin",
  },
  200: {
    fontFamily: "Lato-Light",
  },
  300: {
    fontFamily: "Lato-Light",
  },
  400: {
    fontFamily: "Lato-Regular",
  },
  500: {
    fontFamily: "Lato-Bold",
  },
  600: {
    fontFamily: "Lato-Bold",
  },
  700: {
    fontFamily: "Lato-Bold",
  },
  800: {
    fontFamily: "Lato-Black",
  },
  900: {
    fontFamily: "Lato-Black",
  },
});

/**
 * @typedef Props
 * @property {"normal" | "bold" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900"} weight
 * @property {string} children
 * @property {import("react-native").StyleProp<import("react-native").TextStyle>} style
 * @property {number} size
 * @property {string} color
 * @property {"left" | "center" | "right"} textAlign
 * @property {number} [maxWidth]
 * @property {number} [numberOfLines]
 */
