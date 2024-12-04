import { View, StyleSheet, TouchableOpacity } from "react-native";
import Text from "@/src/components/text";

export default function MatchPromo({ onPress, count = 0 }) {
  let label = "driver";
  if (count > 1) label = "drivers";

  return (
    <View style={styles.matchPromoContainer}>
      <TouchableOpacity onPress={onPress} style={{ width: "100%" }}>
        <View style={styles.promoButton}>
          <Text size={18} color="#fff" weight="medium">
            {count} {label} nearby! Book Now
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  matchPromoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  promoButton: {
    backgroundColor: "#363F59",
    borderRadius: 40,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
  },
});
