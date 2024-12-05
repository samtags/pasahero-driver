import { Stack } from "expo-router";
import Text from "../../src/components/text";
import Setup from "../../src/screens/setup";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          // animation: "ios",
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              Setup your initial location
            </Text>
          ),
          headerTitleAlign: "center",
        }}
      />
      <Setup {...props} />
    </>
  );
}
