import {
  SafeAreaView as RNSafeAreaView,
  StyleSheet,
  Platform,
  StatusBar,
} from "react-native";

/**
 *
 * @param {Props} props
 * @returns
 */
export default function SafeAreaView({ children, style }) {
  return (
    <RNSafeAreaView style={[styles.container, style]}>
      {children}
    </RNSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});

/**
 * @typedef Props
 * @property {React.ReactNode} children
 * @property {import("react-native").ViewStyle} style
 */
