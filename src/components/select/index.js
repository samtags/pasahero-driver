import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useState } from "react";
import WheelPicker from "@quidone/react-native-wheel-picker";
import Text from "@/src/components/text";

export default function Select({
  onClose = () => {},
  options,
  handleSelect,
  closeText,
  confirmText,
  label,
}) {
  const [selected, setSelected] = useState(options[0]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={{ top: 24, bottom: 24, right: 24, left: 24 }}
          onPress={onClose}
        >
          <Text size={18} color="#707070">
            {closeText}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 24, bottom: 24, right: 24, left: 24 }}
          onPress={() => handleSelect(selected)}
        >
          <Text size={18} weight="bold">
            {confirmText}
          </Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text color="#707070" size={18}>
            {label}
          </Text>
        </View>
      </View>
      <WheelPicker
        data={options}
        onValueChanging={(option) => {
          setSelected(option?.item);
        }}
        itemTextStyle={styles.itemTextStyle}
        style={styles.profileWheel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: "0",
    width: "100%",
    zIndex: 1,
  },
  header: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    position: "relative",
  },
  headerTitle: {
    position: "absolute",
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  profileWheel: {
    backgroundColor: "white",
    width: "100%",
    height: 280,
  },
  itemTextStyle: {
    fontFamily: "Lato-Regular",
  },
});
