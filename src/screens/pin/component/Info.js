import { View, StyleSheet } from "react-native";
import Text from "@/src/components/text";
import Cta from "@/src/components/cta";

export default function BottomSheet({ title, subTitle, onConfirm }) {
  return (
    <View style={styles.container}>
      <View style={{ gap: 8 }}>
        <Text numberOfLines={1} size={18} weight="900" color="#353579">
          {title}
        </Text>
        <Text numberOfLines={1} color="#707070">
          {subTitle}
        </Text>
      </View>
      <Cta onPress={() => onConfirm?.()} color="#6366F1">
        Confirm
      </Cta>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingTop: 32,
    paddingBottom: 18,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    gap: 24,
    zIndex: 2,
  },
});
