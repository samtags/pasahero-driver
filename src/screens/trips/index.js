import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import Optional from "@/src/components/optional";
import Request from "./components/request";
import Tabs from "./components/tabs";
import { useRouterParams } from "@/src/services/router";
import useOnFocus from "@/src/services/hooks/useOnFocus";

export default function Trips() {
  const [activeTab, setActiveTab] = useState("MAIN"); // MAIN, NEARBY, HISTORY
  const data = useRouterParams();
  const [trip, setTrip] = useState(data?.extras);

  useOnFocus(() => {
    if (data?.extras && !trip) {
      setTrip(data.extras);
    }
  });

  return (
    <View style={styles.container}>
      <Optional condition={activeTab === "MAIN" && trip.status === "REQUESTED"}>
        <MotiView
          from={{ width: "60%", height: 4 }}
          // animate={{ width: 0 }}
          transition={{ type: "timing", duration: 3000 }}
          style={styles.progressBar}
          onDidAnimate={() => {}}
        />
      </Optional>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <Optional condition={activeTab === "MAIN" && trip.status === "REQUESTED"}>
        <Request
          first_point={trip?.first_point}
          last_point={trip?.last_point}
          notes={trip?.notes}
          payment_method={trip?.payment_method}
          will_add_tip={trip?.will_add_tip}
          estimate_preview={
            trip?.fare[trip?.service]?.estimate_preview ||
            trip?.fare?.estimate_preview
          }
        />
      </Optional>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  spacer: {
    padding: 4,
    gap: 8,
  },
  tab: {
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 3.5,
    borderColor: "#6366F1",
  },
  scrollView: {
    padding: 24,
    gap: 12,
    backgroundColor: "#f9fafb",
  },
  canceledScrollView: {
    padding: 24,
    paddingBottom: 0,
    gap: 12,
    backgroundColor: "#f9fafb",
  },
  serviceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  angkas: { backgroundColor: "#0090F9" },
  joyRide: { backgroundColor: "#181ACA" },
  moveIt: { backgroundColor: "#EF4444" },
  cardHeader: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 16,
  },
  cardContainer: {
    borderBottomColor: "#EAEAEA",
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
  progressBar: {
    height: 7,
    backgroundColor: "#F59E0B",
  },
  paymentTypeContainer: {
    gap: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  paymentTypeChip: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
  },
  serviceChargeContainer: {
    marginTop: 16,
    gap: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  serviceChargeChip: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tipChip: {
    backgroundColor: "#6366F1",
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 2,
    borderRadius: 10,
    position: "absolute",
    left: 101,
    top: -2,
  },
});
