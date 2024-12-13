import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "@/src/components/text";
import router from "@/src/services/router";

export default function FAQs() {
  return (
    <ScrollView style={styles.full} contentContainerStyle={styles.full}>
      <View style={styles.container}>
        <Link href="/transfer-angkas">How to transfer trip to Angkas?</Link>
        <Link href="/transfer-joyride">How to transfer trip to JoyRide?</Link>
        <Link href="/transfer-move-it">How to transfer trip to Move It?</Link>
      </View>
    </ScrollView>
  );
}

/**
 *
 * @param {ItemProps} props
 * @returns
 */
function Link({
  href,
  children,
  onPress = () => {}, //
}) {
  const handleOnPress = () => {
    if (href) router.navigate({ pathname: href });
    onPress?.();
  };

  return (
    <View style={styles.item}>
      <TouchableOpacity onPress={handleOnPress} style={styles.link}>
        <Text size={18}>{children}</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * @typedef ItemProps
 *
 */

const styles = StyleSheet.create({
  link: {
    borderBottomWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderColor: "#EAEAEA",
  },
  // item: { paddingHorizontal: 16 },
  full: {
    flex: 1,
  },
  container: { backgroundColor: "white", flex: 1 },
});
