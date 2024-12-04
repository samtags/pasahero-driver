import { StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "../../components/text";
import { Image } from "expo-image";
import { Skeleton } from "moti/skeleton";
import {
  checkBoxChecked,
  checkBoxUnchecked,
} from "../../services/images/remote";

/**
 *
 * @param {Props} props
 * @returns
 */
export default function EstimateItem({
  platform,
  serviceName,
  serviceImage,
  estimatedFare,
  highlightColor,
  isSelected,
  onSelect,
  isLoading,
}) {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.contentRow}>
          <Skeleton radius="round" width={24} height={24} colorMode="light" />
          <View style={{ gap: 4 }}>
            <Skeleton width={140} height={14} colorMode="light" />
            <Skeleton width={95} height={10} colorMode="light" />
          </View>
        </View>
        <View style={styles.checkboxContainer}>
          <Skeleton radius={2} width={15} height={15} colorMode="light" />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={() => onSelect?.()}>
      <View style={styles.container}>
        <View style={styles.contentRow}>
          <View style={styles.serviceImageContainer}>
            <Image
              source={serviceImage}
              cachePolicy="memory-disk"
              style={styles.image}
            />
          </View>
          <View>
            <Text size={18} color="#1B1B1B" weight="bold">
              {estimatedFare}
            </Text>
            <Text size={14} color="#707070">
              <Text size={14} color={highlightColor} weight="bold">
                {platform}
              </Text>{" "}
              {serviceName}
            </Text>
          </View>
        </View>
        <View style={styles.checkboxContainer}>
          <Image
            style={styles.image}
            cachePolicy="memory-disk"
            source={isSelected ? checkBoxChecked : checkBoxUnchecked}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderColor: "#EAEAEA",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  serviceImageContainer: {
    width: 24,
    height: 24,
    backgroundColor: "#e5e7eb",
    borderRadius: 24,
    overflow: "hidden",
  },
  checkboxContainer: {
    height: 15,
    width: 15,
    overflow: "hidden",
  },
  checkboxButton: {
    padding: 8,
  },
  image: {
    height: "100%",
    width: "100%",
  },
});

/**
 * @typedef Props
 * @property {string} platform
 * @property {string} serviceName
 * @property {string} estimatedFare
 * @property {string} highlightColor
 * @property {boolean} [isSelected]
 * @property {() => unknown} onSelect
 * @property {boolean} [isLoading]
 */
