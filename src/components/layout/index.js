import { useState } from "react";
import { StyleSheet, View } from "react-native";
import Optional from "../optional";

/**
 * Use case: For a scenarios that you need to define a static height and width from a dynamically rendered component.
 */
export default function LayoutHandler({ children }) {
  const [height, setHeight] = useState();
  const [width, setWidth] = useState();

  return (
    <>
      <View pointerEvents="none" accessible={false} style={styles.replica}>
        <View
          onLayout={(e) => {
            setHeight(e.nativeEvent.layout.height);
            setWidth(e.nativeEvent.layout.width);
          }}
        >
          {children}
        </View>
      </View>
      <Optional condition={height && width}>
        <View style={{ width, height }}>{children}</View>
      </Optional>
    </>
  );
}

const styles = StyleSheet.create({
  replica: {
    position: "absolute",
    zIndex: -1000,
    left: -50000,
    opacity: 0,
  },
});
