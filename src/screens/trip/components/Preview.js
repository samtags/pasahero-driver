import { View } from "react-native";

export default function Preview({ children, style = {}, onChangeHeight }) {
  return (
    <View
      onLayout={(e) => onChangeHeight?.(e.nativeEvent.layout.height)}
      pointerEvents="box-none"
      style={style}
    >
      {children}
    </View>
  );
}
