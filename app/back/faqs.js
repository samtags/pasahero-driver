import { Stack } from "expo-router";
import Text from "@/src/components/text";
import FAQs from "@/src/screens/faqs";

export default function Entry(props) {
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Text size={19} weight="bold" color="#353579">
              FAQs
            </Text>
          ),
          headerTitleAlign: "center",
          headerTintColor: "#757477",
        }}
      />
      <FAQs />
    </>
  );
}
