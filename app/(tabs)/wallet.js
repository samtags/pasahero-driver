import WalletScreen from "@/src/screens/wallet";
import { StyleSheet } from "react-native";

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
