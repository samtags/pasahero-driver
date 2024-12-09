import { View, Text, StyleSheet } from "react-native";
import Trips from "@/src/screens/trips";

export default function Tab(props) {
  return <Trips {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
