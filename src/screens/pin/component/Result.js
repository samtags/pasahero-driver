import { useEffect } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity } from "react-native";
import Text from "@/src/components/text";
import log from "@/src/services/log";

export default function Result({ data = [], onSelect }) {
  useEffect(() => {
    log.debug("Showing search results", data);
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {data?.map((item) => (
        <SearchResult
          onPress={() => onSelect?.(item)}
          key={item.PlaceId}
          title={item.Description}
          subTitle={item.Text}
        />
      ))}
    </ScrollView>
  );
}

export function SearchResult({ title, subTitle, onPress }) {
  return (
    <TouchableOpacity onPress={() => onPress?.()}>
      <View style={styles.result}>
        <Text color="#707070" size={15} weight="500">
          {title}
        </Text>
        <Text size={15} color="#707070" numberOfLines={2}>
          {subTitle}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  content: {
    borderRadius: 12,
    backgroundColor: "white",
  },
  result: {
    padding: 16,
    gap: 8,
  },
});
