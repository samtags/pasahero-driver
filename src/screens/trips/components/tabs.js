import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text as RNText,
} from "react-native";
import Text from "@/src/components/text";
import getColorByService from "@/src/services/util/colors/getColorByService";
import { useMMKVString } from "react-native-mmkv";

export default function Tabs({ activeTab = "MAIN", setActiveTab, tripStatus }) {
  const [status] = useMMKVString("controller.status");
  const [service] = useMMKVString("user.service");
  let color = "#6366F1";

  if (status === "ACTIVE") color = getColorByService(service);

  let mainTabLabel = "Request";

  if (tripStatus && tripStatus !== "REQUESTED") {
    mainTabLabel = "Active";
  }

  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        onPress={() => setActiveTab("MAIN")}
        style={{ flex: 1 }}
      >
        <View
          style={[styles.tab, activeTab === "MAIN" && styles.activeTab(color)]}
        >
          <Text weight={activeTab === "MAIN" ? "700" : undefined}>
            {mainTabLabel}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("NEARBY")}
        style={{ flex: 1 }}
      >
        <View
          style={[
            styles.tab,
            activeTab === "NEARBY" && styles.activeTab(color),
          ]}
        >
          <Text weight={activeTab === "NEARBY" ? "700" : undefined}>
            Nearby
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("HISTORY")}
        style={{ flex: 1 }}
      >
        <View
          style={[
            styles.tab,
            activeTab === "HISTORY" && styles.activeTab(color),
          ]}
        >
          <Text weight={activeTab === "HISTORY" ? "700" : undefined}>
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
    justifyContent: "center",
  },
  activeTab: (color) => ({
    borderBottomWidth: 3.5,
    borderColor: color || "#6366F1",
  }),
});
