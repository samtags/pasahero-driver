import WalletScreen from "@/src/screens/wallet";
import { View, Text, StyleSheet } from "react-native";

export default function Tab() {
  return <WalletScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
