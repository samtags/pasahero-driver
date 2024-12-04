import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { to, closeGray, from } from "@/src/services/images/remote";
import Optional from "@/src/components/optional";
import log from "@/src/services/log";

export default function Input({
  onChangeText,
  onFocus,
  onBlur,
  value,
  selection,
  onClear,
  showClearOption,
  placeholder,
  indicatorType,
}) {
  const handleOnFocus = () => {
    log.debug("User tapped the search input.", { actionType: "tap" });
    onFocus?.();
  };

  const handleOnBlur = () => {
    log.debug("User closes the search input.");
    onBlur?.();
  };

  const handleChangeText = (text) => {
    log.debug("User changes the search input text.", { actionType: "change", text }); // prettier-ignore
    onChangeText?.(text);
  };

  let indicator = from;
  if (indicatorType === "to") indicator = to;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image
          style={styles.indicator}
          cachePolicy="memory-disk"
          source={indicator}
        />
        <TextInput
          selection={selection}
          onFocus={handleOnFocus}
          onBlur={handleOnBlur}
          placeholder={placeholder}
          style={styles.textInput}
          onChangeText={handleChangeText}
          value={value}
        />
      </View>
      <Optional condition={showClearOption}>
        <TouchableOpacity onPress={() => onClear?.()}>
          <Image
            style={{ width: 20, height: 20 }}
            cachePolicy="memory-disk"
            source={closeGray}
          />
        </TouchableOpacity>
      </Optional>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textInput: {
    fontSize: 16,
    fontFamily: "Lato-Bold",
    color: "#1B1B1B",
    flex: 1,
    paddingRight: 16,
  },
  indicator: { width: 16, height: 16 },
});
