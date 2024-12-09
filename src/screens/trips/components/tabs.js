import { View, StyleSheet, TouchableOpacity } from "react-native";
import Text from "@/src/components/text";

export default function Tabs({ activeTab = "MAIN", setActiveTab }) {
  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        onPress={() => setActiveTab("MAIN")}
        style={{ flex: 1 }}
      >
        <View style={[styles.tab, activeTab === "MAIN" && styles.activeTab]}>
          <Text
            color="#353579"
            weight={activeTab === "MAIN" ? "700" : undefined}
          >
            Request
            {/* Current */}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("NEARBY")}
        style={{ flex: 1 }}
      >
        <View style={[styles.tab, activeTab === "NEARBY" && styles.activeTab]}>
          <Text
            color="#353579"
            weight={activeTab === "NEARBY" ? "700" : undefined}
          >
            Nearby
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("HISTORY")}
        style={{ flex: 1 }}
      >
        <View style={[styles.tab, activeTab === "HISTORY" && styles.activeTab]}>
          <Text
            color="#353579"
            weight={activeTab === "HISTORY" ? "700" : undefined}
          >
            History
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  tab: {
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3.5,
    borderColor: "#6366F1",
  },
});
