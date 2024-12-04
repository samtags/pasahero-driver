import { useContext } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Back from "./Back";
import Input from "./Input";
import Result from "./Result";
import Optional from "@/src/components/optional";
import { Context } from "./Provider";
import log from "@/src/services/log";

export default function Control({ placeholder, indicatorType }) {
  const {
    selected,
    setSelected,
    isKeyboardVisible,
    setQ,
    displayedValue,
    setDisplayedValue,
    suggestion,
  } = useContext(Context);

  const handleOnSelect = (data) => {
    setSelected(data);
    setDisplayedValue(data.Description);

    log.debug("User selected a search result.", { actionType: "tap", data }); // prettier-ignore
  };

  const handleChangeText = (value) => {
    setQ(value);
    setDisplayedValue(value);
  };

  const handleOnClear = () => {
    setQ("");
    setDisplayedValue("");

    log.debug("User cleared the search input.", { actionType: "tap" });
  };

  let selectionSetting = undefined;
  const containerStyles = [styles.container];

  if (isKeyboardVisible === false) {
    selectionSetting = { start: 0, end: displayedValue?.length };
    containerStyles.push(styles.short);
  } else {
    containerStyles.push(styles.long);
  }

  return (
    <View pointerEvents="box-none" style={containerStyles}>
      <View style={styles.row}>
        <Back />
        <Input
          indicatorType={indicatorType}
          placeholder={placeholder}
          onClear={handleOnClear}
          selection={selectionSetting}
          onChangeText={handleChangeText}
          value={displayedValue}
          showClearOption={isKeyboardVisible && displayedValue}
        />
      </View>

      <Optional condition={Boolean(selected) === false}>
        <Optional condition={suggestion?.length > 0}>
          <Result onSelect={handleOnSelect} data={suggestion} />
        </Optional>
      </Optional>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    padding: 16,
    paddingTop: 40,
    width: Dimensions.get("window").width,
    height: "100%",
    zIndex: 2,
  },
  row: {
    flexDirection: "row",
    zIndex: 1,
  },
  short: {
    height: "75%",
  },
  long: {
    height: "100%",
  },
});
