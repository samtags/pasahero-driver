import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { MotiView } from "moti";
import Optional from "@/src/components/optional";
import Request from "./components/request";
import Tabs from "./components/tabs";
import router, { useRouterParams } from "@/src/services/router";
import { useMutation } from "@tanstack/react-query";
import takeTripRequest from "@/src/services/api/takeTripRequest";
import rejectTripRequest from "@/src/services/api/rejectTripRequest";

export default function Trips() {
  const data = useRouterParams();

  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState("MAIN"); // MAIN, NEARBY, HISTORY

  const take = useTakeTrip(trip?.id);
  const refuse = useRejectTrip(trip?.id);

  async function handleRefuse() {
    await refuse?.send();
    setTrip(null);
    router.navigate({ pathname: "/" });
    router.resetParams("/(tabs)/trips");
  }

  useEffect(() => {
    console.debug("Detected change from router params", { data });
    if (data?.extras && !trip) {
      console.log("Rehydrating trip details by router params update");
      setTrip(data.extras);
    }
  }, [data]);

  return (
    <View style={styles.container}>
      <Optional
        condition={activeTab === "MAIN" && trip?.status === "REQUESTED"}
      >
        <MotiView
          from={{ width: "60%", height: 4 }}
          // animate={{ width: 0 }}
          transition={{ type: "timing", duration: 3000 }}
          style={styles.progressBar}
          onDidAnimate={() => {}}
        />
      </Optional>

      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <Optional
        condition={activeTab === "MAIN" && trip?.status === "REQUESTED"}
      >
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
          isTaking={take.isPending}
          isRefusing={refuse.isPending}
          handleTake={take?.send}
          handleRefuse={handleRefuse}
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

function useTakeTrip(id) {
  const { mutate, isPending } = useMutation({
    mutationFn: () => takeTripRequest(id),
  });

  return { send: mutate, isPending };
}

function useRejectTrip(id) {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => rejectTripRequest(id),
  });

  return { send: mutateAsync, isPending };
}
