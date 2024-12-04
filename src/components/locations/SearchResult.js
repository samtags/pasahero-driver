import { View, StyleSheet, TouchableOpacity } from "react-native";
import Text from "@/src/components/text";
import { Image } from "expo-image";
import { origin } from "@/src/services/images/remote";

/**
 *
 * @param {PredictionProps} props
 */
export default function SearchResult({
  shortAddress,
  longAddress,
  onPress,
  indicator,
}) {
  return (
    <TouchableOpacity onPress={() => onPress?.()}>
      <View style={styles.container}>
        <Image
          style={styles.indicator}
          cachePolicy="memory-disk"
          source={indicator ?? origin}
        />
        <View style={styles.content}>
          <Text numberOfLines={1} color="#1B1B1B" weight="bold" size={18}>
            {shortAddress}
          </Text>
          <Text numberOfLines={2} color="#707070" size={14}>
            {longAddress}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingLeft: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EAEAEA",
  },
  indicator: {
    width: 24,
    height: 24,
  },
  content: {
    gap: 6,
    flex: 1,
    paddingRight: 16,
  },
});

/**
 * @typedef PredictionProps
 * @property {string} shortAddress
 * @property {string} longAddress
 * @property {() => unknown} [onPress]
 */
