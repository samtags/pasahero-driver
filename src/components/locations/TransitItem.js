import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import Optional from "../optional";
import { useState } from "react";
import useOnUpdate from "../../services/hooks/useOnUpdate";
import { Image } from "expo-image";
import { pinWhite } from "../../services/images/remote";

/**
 * @typedef Props
 * @property {() => unknown} onPress
 * @property {string} placeholder
 * @property {(v: string) => void} onChangeText
 * @property {boolean} [isActive]
 * @property {() => unknown} [onClear]
 * @property {string} [overwriteValue]
 * @property {boolean} [showPinOption]
 * @property {() => void} [onPressPin]
 * @property {() => void} [onFocus]
 *
 * @param {Props} props
 * @returns
 */
export default function TransitItem(props) {
  const {
    onPress,
    placeholder,
    onChangeText,
    isActive,
    onClear,
    overwriteValue,
    showPinOption,
    onPressPin,
    onFocus,
  } = props;

  const [value, setValue] = useState("");

  useOnUpdate(() => {
    setValue(props.overwriteValue);
  }, [overwriteValue]);

  const contentStyles = [styles.transit];
  if (isActive) contentStyles.push(styles.active);

  const handleChangeText = (v) => {
    setValue(v);
    onChangeText(v);
  };

  function handleOnClear() {
    setValue("");
    onClear?.();
  }

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.container}>
        <View style={contentStyles}>
          <View style={styles.transitIcon} />
          <View style={styles.full}>
            <Optional condition={isActive}>
              <TextInput
                autoFocus
                onFocus={() => onFocus?.()}
                value={value}
                onChangeText={handleChangeText}
                style={styles.input}
                placeholder={placeholder}
              />
            </Optional>
            <Optional condition={Boolean(isActive) === false}>
              <>
                <Optional condition={Boolean(value) === false}>
                  <Text numberOfLines={1}>{placeholder}</Text>
                </Optional>

                <Optional condition={value}>
                  <Text numberOfLines={1}>{value}</Text>
                </Optional>
              </>
            </Optional>
          </View>
          <Optional condition={isActive && value}>
            <TouchableOpacity onPress={handleOnClear}>
              <View style={styles.clearIcon} />
            </TouchableOpacity>
          </Optional>
        </View>
        <Optional condition={showPinOption}>
          <TouchableOpacity
            style={{ alignItems: "center" }}
            onPress={() => onPressPin?.()}
          >
            <Image
              style={{ height: 20, width: 20 }}
              source={pinWhite}
              contentFit="cover"
            />
            <Text style={{ fontWeight: "700", fontSize: 9 }}>Pin</Text>
          </TouchableOpacity>
        </Optional>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transit: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    position: "relative",
  },
  transitIcon: {
    height: 20,
    width: 20,
    borderRadius: 20,
    backgroundColor: "gainsboro",
  },
  mapIcon: {
    height: 20,
    width: 20,
    borderRadius: 4,
    backgroundColor: "gainsboro",
  },
  clearIcon: {
    height: 14,
    width: 14,
    borderRadius: 14,
    backgroundColor: "gainsboro",
  },
  active: {
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
  },
  full: {
    flex: 1,
  },
});
