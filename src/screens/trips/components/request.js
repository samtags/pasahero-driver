import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import Text from "@/src/components/text";
import { Image } from "expo-image";
import { current, first, last } from "@/src/services/images/remote";
import Cta from "@/src/components/cta";
import Optional from "@/src/components/optional";
import getDistance from "@/src/services/util/haversine/getDistance";
import JSON from "@/src/services/json";

export default function Request({
  isExpiring,
  first_point,
  last_point,
  notes,
  payment_method,
  estimate_preview,
  will_add_tip,
  isTaking,
  isRefusing,
  handleTake = () => {},
  handleRefuse = () => {},
}) {
  const location = JSON.parse(storage.getString("user.location"));

  const distance = getDistance(
    location?.latitude,
    location?.longitude,
    first_point?.latitude,
    first_point?.longitude
  );

  const isLoading = isTaking || isRefusing;
  console.log("🚀 ~ isLoading:", isLoading);

  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        <Optional condition={isExpiring}>
          <Text color="#F59E0B" size={18} weight="bold">
            Expiring Soon
          </Text>
        </Optional>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Image
            source={current}
            style={{ width: 40, height: 40 }}
            cachePolicy="memory-disk"
          />
          <View style={{ gap: 4 }}>
            <Text weight="700" size={18} color="#1B1B1B">
              Current Location
            </Text>
            <Optional condition={distance}>
              <Text size={14} color="#707070">
                Approximately {distance} km away from pickup
              </Text>
            </Optional>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity>
            <Image
              source={first}
              style={{ width: 40, height: 40 }}
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
          <TouchableWithoutFeedback>
            <View style={{ gap: 4, flex: 1 }}>
              <Text weight="700" size={18} color="#1B1B1B">
                {first_point?.short_address}
              </Text>
              <Text size={14} color="#707070">
                {first_point?.long_address}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity>
            <Image
              source={last}
              style={{ width: 40, height: 40 }}
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
          <TouchableWithoutFeedback>
            <View style={{ gap: 4, flex: 1 }}>
              <Text weight="700" size={18} color="#1B1B1B">
                {last_point?.short_address}
              </Text>
              <Text size={14} color="#707070">
                {last_point?.long_address}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={{ gap: 7 }}>
          <Text size={18} weight="700" color="#707070">
            Notes
          </Text>
          <Text weight="700" size={18} color="#1B1B1B">
            {notes || "-"}
          </Text>
        </View>

        <View style={styles.paymentTypeContainer}>
          <View>
            <Text size={18} weight="700" color="#707070">
              Payment Type
            </Text>
          </View>
          <View style={styles.paymentTypeChip}>
            <Text size={18} weight="700" color="#FFF">
              {payment_method || "Cash"}
            </Text>
          </View>
        </View>

        <View style={styles.serviceChargeContainer}>
          <View style={{ flex: 1, gap: 7 }}>
            <Text size={18} weight="700" color="#707070">
              Service Charge
            </Text>
            <Text size={14} color="#707070">
              Kindly collect service charge to the passenger. On top of the fare
              and tip.
            </Text>
          </View>
          <View style={styles.serviceChargeChip}>
            <Text
              size={14}
              color="#fff"
              style={{
                textDecorationLine: "line-through",
                textDecorationStyle: "solid",
              }}
            >
              P 10.00
            </Text>
            <Text size={18} weight="700" color="#fff">
              P 0.00
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "center", marginTop: 64 }}>
          <View style={{ position: "relative", gap: 4 }}>
            <Text size={14} weight="700" color="#707070">
              Estimated Fare
            </Text>

            {/* <View style={styles.tipChip}>
                <Text size={12} weight="700" color="#FFF">
                  +Tip
                </Text>
              </View> */}
          </View>
        </View>

        <Text textAlign="center" size={34} color="#353579" weight="700">
          {estimate_preview} {will_add_tip && "+"}
        </Text>
        <View>
          <Text textAlign="center" size={13} color="#707070">
            Estimation is based on fare structure set by LTFRB.
          </Text>
          <Text textAlign="center" size={13} color="#707070">
            Estimated fare may vary in the actual trip in the application.
          </Text>
        </View>

        <Optional condition={isLoading}>
          <ActivityIndicator
            size="large"
            color={isTaking ? "#10B981" : "#EF4444"}
          />
        </Optional>

        <Optional condition={!isLoading}>
          <View>
            <Cta onPress={handleRefuse} color="transparent" textColor="#EF4444">
              Refuse
            </Cta>

            <Cta onPress={handleTake} color="#10B981">
              Take
            </Cta>
          </View>
        </Optional>
      </ScrollView>
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
