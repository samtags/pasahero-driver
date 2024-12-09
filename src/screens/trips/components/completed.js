import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import route from "@/src/services/router";
import Text from "@/src/components/text";
import { Image } from "expo-image";
import log from "@/src/services/log";
import { dropoff, pickup } from "@/src/services/images/remote";
import moment from "moment/moment";
import storage from "@/src/services/storage";

export default function Completed() {
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
  canceledScrollView: {
    padding: 24,
    paddingBottom: 0,
    gap: 12,
    backgroundColor: "#f9fafb",
  },
  cardContainer: {
    borderBottomColor: "#EAEAEA",
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
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
  serviceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  angkas: { backgroundColor: "#0090F9" },
  joyRide: { backgroundColor: "#181ACA" },
  moveIt: { backgroundColor: "#EF4444" },
});
