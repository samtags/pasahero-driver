import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Text from "../../components/text";

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
  const router = useRouter();

  const handleOnPress = () => {
    if (href) router.navigate(href);
    onPress?.();
  };

  return (
    <View style={styles.item}>
      <TouchableOpacity onPress={handleOnPress} style={styles.link}>
        <Text size={18} color="#353579">
          {children}
        </Text>
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
    paddingHorizontal: 16,
    borderColor: "#EAEAEA",
  },
  item: { paddingHorizontal: 16 },
  full: {
    flex: 1,
  },
  container: { backgroundColor: "white", flex: 1 },
});
