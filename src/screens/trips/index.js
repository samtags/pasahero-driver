import { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import route from "@/src/services/router";
import Text from "@/src/components/text";
import { Image } from "expo-image";
import getLabel from "@/src/services/util/status/getLabel";
import log from "@/src/services/log";
import { dropoff, pickup, star } from "@/src/services/images/remote";
import Optional from "@/src/components/optional";
import moment from "moment/moment";
import storage from "@/src/services/storage";
import useTrips from "@/src/services/queries/useTrips";
// import useGetDriverProfile from "@/src/services/queries/useGetDriverProfile";
// import useCanceledTrips from "@/src/services/queries/useCanceledTrips";
// import useCompletedTrips from "@/src/services/queries/useCompletedTrips";

export default function List() {
  const [activeTab, setActiveTab] = useState("ONGOING"); // ONGOING, COMPLETED, CANCELED

  return (
    <View style={styles.container}>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <Optional condition={activeTab === "ONGOING"}>
        <Ongoing />
      </Optional>

      <Optional condition={activeTab === "COMPLETED"}>
        <Completed />
      </Optional>

      <Optional condition={activeTab === "CANCELED"}>
        <Canceled />
      </Optional>
    </View>
  );
}

function Ongoing() {
  const { data } = useTrips();
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollView}>
      {data?.map((trip) => (
        <OngoingTripCard
          key={trip.id}
          onPress={() => route.navigate({ pathname: "/trip", params: trip })}
          name={trip.passenger_id}
          platform={trip.estimatePreview}
          status={trip.status}
          firstAddress={trip.first_point?.long_address}
          lastAddress={trip.last_point?.long_address}
          profile_id={trip.profile_id}
        />
      ))}
    </ScrollView>
  );
}

function Canceled() {
  const { data } = {};
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.canceledScrollView}
    >
      {data?.map((match) => {
        let fareEstimate = "-";

        if (match.fare) {
          fareEstimate = `${match.fare.minFare} - ${match.fare.maxFare}`;
        }

        function handleRebook() {
          log.debug("Rebooking trip", { match });

          const draft = {
            first: {
              latitude: match.first_point.latitude,
              longitude: match.first_point.longitude,
              shortAddress: match.first_point.short_address,
              longAddress: match.first_point.long_address,
            },
            last: {
              latitude: match.last_point.latitude,
              longitude: match.last_point.longitude,
              shortAddress: match.last_point.short_address,
              longAddress: match.last_point.long_address,
            },
          };

          // set match draft
          storage.set("match.draft", JSON.stringify(draft));

          // then navigate to trip request screen
          route.navigate({
            pathname: "/match/request",
            params: {
              from: {
                pathname: "/match/list",
                params: {
                  previousTab: "CANCELED",
                },
              },
            },
          });
        }

        return (
          <CanceledTripCard
            key={match.id}
            onPress={handleRebook}
            firstAddress={match.first_point?.long_address}
            lastAddress={match.last_point?.long_address}
            create={match.created_at}
            fareEstimate={fareEstimate}
          />
        );
      })}
    </ScrollView>
  );
}

function Completed() {
  const { data } = {};

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.canceledScrollView}
    >
      {data?.map((match) => {
        let fareEstimate = "-";

        if (match.fare) {
          fareEstimate = `${match.fare.minFare} - ${match.fare.maxFare}`;
        }

        function handleRebook() {
          log.debug("Rebooking trip", { match });

          const draft = {
            first: {
              latitude: match.first_point.latitude,
              longitude: match.first_point.longitude,
              shortAddress: match.first_point.short_address,
              longAddress: match.first_point.long_address,
            },
            last: {
              latitude: match.last_point.latitude,
              longitude: match.last_point.longitude,
              shortAddress: match.last_point.short_address,
              longAddress: match.last_point.long_address,
            },
          };

          // set match draft
          storage.set("match.draft", JSON.stringify(draft));

          // then navigate to trip request screen
          route.navigate({
            pathname: "/match/request",
            params: {
              from: {
                pathname: "/match/list",
                params: {
                  previousTab: "COMPLETED",
                },
              },
            },
          });
        }

        return (
          <CompletedTripCard
            key={match.id}
            onPress={handleRebook}
            firstAddress={match.first_point?.long_address}
            lastAddress={match.last_point?.long_address}
            create={match.created_at}
            fareEstimate={fareEstimate}
          />
        );
      })}
    </ScrollView>
  );
}

function Tabs({ activeTab = "ONGOING", setActiveTab }) {
  return (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        onPress={() => setActiveTab("ONGOING")}
        style={{ flex: 1 }}
      >
        <View style={[styles.tab, activeTab === "ONGOING" && styles.activeTab]}>
          <Text
            color="#353579"
            weight={activeTab === "ONGOING" ? "700" : undefined}
          >
            Ongoing
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("COMPLETED")}
        style={{ flex: 1 }}
      >
        <View
          style={[styles.tab, activeTab === "COMPLETED" && styles.activeTab]}
        >
          <Text
            color="#353579"
            weight={activeTab === "COMPLETED" ? "700" : undefined}
          >
            Completed
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setActiveTab("CANCELED")}
        style={{ flex: 1 }}
      >
        <View
          style={[styles.tab, activeTab === "CANCELED" && styles.activeTab]}
        >
          <Text
            color="#353579"
            weight={activeTab === "CANCELED" ? "700" : undefined}
          >
            Canceled
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

function OngoingTripCard({
  name = "[name]",
  platform = "",
  rating = `4.6`,
  status = "[status]",
  firstAddress = "[address1]",
  lastAddress = "[address2]",
  onPress = () => {},
  profile_id,
}) {
  const { data: profile } = {};

  let title = "";

  if (profile) {
    `${profile?.vehicle_make} ${profile?.vehicle_model} (${profile?.vehicle_plate_number})`;
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ padding: 16, borderRadius: 24, backgroundColor: "white" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderBottomColor: "#F4F4F4",
            borderBottomWidth: 1,
            paddingBottom: 16,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", gap: 12, flex: 1 }}>
            {/* <View
              style={{
                backgroundColor: "#D9D9D9",
                width: 55,
                height: 55,
                borderRadius: 10,
              }}
            /> */}
            <View style={{ flex: 1, gap: 4 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Text
                  style={{ flex: 1 }}
                  weight="700"
                  size={18}
                  color="#363F59"
                  numberOfLines={1}
                >
                  {title}
                </Text>
                <View
                  style={{
                    paddingHorizontal: 10,
                    borderColor: "#D9D9D9",
                    borderWidth: 2.5,
                    borderRadius: 24,
                    height: 32,
                    flexDirection: "row",
                    gap: 4,
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Image
                    source={star}
                    style={{ width: 16, height: 16 }}
                    cachePolicy="memory-disk"
                  />
                  <Text size={14} weight="900">
                    {rating}
                  </Text>
                </View>
              </View>
              <Text weight="700" size={14} color="#707070">
                {platform}
              </Text>
            </View>
          </View>
          <View style={{ flexShrink: 0 }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 4,
                backgroundColor: "#6366F1",
              }}
            >
              <Text color="white" size={14} weight="700">
                {getLabel(status)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ paddingVertical: 16 }}>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Image
              source={pickup}
              style={{ width: 20, height: 20 }}
              cachePolicy="memory-disk"
            />
            <Text
              weight="700"
              color="#1b1b1b"
              style={{ flex: 1 }}
              numberOfLines={2}
            >
              {firstAddress}
            </Text>
          </View>
          <View style={{ flexDirection: "row", paddingVertical: 8 }}>
            <Text
              style={{
                transform: [{ rotate: "90deg" }],
              }}
              size={18}
              weight="700"
              color="#D9D9D9"
            >
              ---
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Image
              source={dropoff}
              style={{ width: 20, height: 20 }}
              cachePolicy="memory-disk"
            />
            <Text
              weight="700"
              color="#1b1b1b"
              style={{ flex: 1 }}
              numberOfLines={2}
            >
              {lastAddress}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CanceledTripCard({
  firstAddress = "[address1]",
  lastAddress = "[address2]",
  onPress = () => {},
  created_at,
  fareEstimate,
}) {
  let date = moment(created_at).format("(ddd) MMMM DD HH:mm A");

  return (
    <View style={styles.cardContainer}>
      <View style={{ paddingVertical: 16 }}>
        <View style={styles.cardHeader}>
          <View>
            <Text size={20} color="#363F59" weight="700">
              Canceled
            </Text>
            <Text color="#707070">{date}</Text>
          </View>

          <TouchableOpacity onPress={onPress}>
            <Text
              style={{ textDecorationLine: "underline" }}
              size={14}
              color="#637AF1"
            >
              Having same trip?
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Image
              source={pickup}
              style={{ width: 20, height: 20 }}
              cachePolicy="memory-disk"
            />
            <Text color="#1b1b1b" style={{ flex: 1 }} numberOfLines={1}>
              {firstAddress}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Image
              source={dropoff}
              style={{ width: 20, height: 20 }}
              cachePolicy="memory-disk"
            />
            <Text color="#1b1b1b" style={{ flex: 1 }} numberOfLines={1}>
              {lastAddress}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={{ flexDirection: "row", marginTop: 16, gap: 4 }}>
            <View style={[styles.serviceChip, styles.angkas]}>
              <Text weight="bold" size={12} color="white">
                Passenger
              </Text>
            </View>

            <View style={[styles.serviceChip, styles.joyRide]}>
              <Text weight="bold" size={12} color="white">
                MC Taxi
              </Text>
            </View>

            <View style={[styles.serviceChip, styles.moveIt]}>
              <Text weight="bold" size={12} color="white">
                MotoTaxi
              </Text>
            </View>
          </View>
          <Text size={20} color="#363F59" weight="700">
            {fareEstimate}
          </Text>
        </View>
      </View>
    </View>
  );
}

function CompletedTripCard({
  firstAddress = "[address1]",
  lastAddress = "[address2]",
  onPress = () => {},
  created_at,
  fareEstimate,
}) {
  let date = moment(created_at).format("(ddd) MMMM DD HH:mm A");

  return (
    <View style={styles.cardContainer}>
      <View style={{ paddingVertical: 16 }}>
        <View style={styles.cardHeader}>
          <View>
            <Text size={20} color="#363F59" weight="700">
              Completed
            </Text>
            <Text color="#707070">{date}</Text>
          </View>

          <TouchableOpacity onPress={onPress}>
            <Text
              style={{ textDecorationLine: "underline" }}
              size={14}
              color="#637AF1"
            >
              Having same trip?
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Image
              source={pickup}
              style={{ width: 20, height: 20 }}
              cachePolicy="memory-disk"
            />
            <Text color="#1b1b1b" style={{ flex: 1 }} numberOfLines={1}>
              {firstAddress}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <Image
              source={dropoff}
              style={{ width: 20, height: 20 }}
              cachePolicy="memory-disk"
            />
            <Text color="#1b1b1b" style={{ flex: 1 }} numberOfLines={1}>
              {lastAddress}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View style={{ flexDirection: "row", marginTop: 16, gap: 4 }}>
            <View style={[styles.serviceChip, styles.angkas]}>
              <Text weight="bold" size={12} color="white">
                Passenger
              </Text>
            </View>

            <View style={[styles.serviceChip, styles.joyRide]}>
              <Text weight="bold" size={12} color="white">
                MC Taxi
              </Text>
            </View>

            <View style={[styles.serviceChip, styles.moveIt]}>
              <Text weight="bold" size={12} color="white">
                MotoTaxi
              </Text>
            </View>
          </View>
          <Text size={20} color="#363F59" weight="700">
            {fareEstimate}
          </Text>
        </View>
      </View>
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
});
