import Text from "@/src/components/text";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import Cta from "@/src/components/cta";
import { Image } from "expo-image";
import { transaction } from "@/src/services/images/remote";
import useWallets from "@/src/services/queries/useWallet";
import amount from "@/src/services/util/amount";
import router from "@/src/services/router";
import storage from "@/src/services/storage";
import useTopups from "@/src/services/queries/useTopups";
import Optional from "@/src/components/optional";
import useOnFocus from "@/src/services/hooks/useOnFocus";

// todo: configure balance threshold in growthbook
export default function WalletScreen() {
  const { data: wallet, refetch: getWallet } = useWallets();
  const { data: topups, refetch: getTopups } = useTopups();

  useOnFocus(() => {
    getWallet();
    getTopups();
  });

  function handleTopup() {
    const user = storage.getString("user.id");
    if (!user) {
      return Alert.alert(
        "Walang account",
        "Siguraduhing naka sign-in muna bago mag top-up.",
        [
          {
            text: "OK",
            onPress: () => {
              router.navigate({ pathname: "/(tabs)/settings" });
            },
          },
        ]
      );
    }

    router.navigate({ pathname: "/top-up" });
  }

  return (
    <View style={styles.container}>
      <View style={{ flexShrink: 0, paddingTop: 16, gap: 8 }}>
        <Optional condition={topups?.length}>
          <View style={styles.topupNotice}>
            <Text color="#fff">
              You have {topups?.length || 0} Top-up Requests
            </Text>
          </View>
        </Optional>
        <Text size={18} color="#707070" textAlign="center">
          Available Balance
        </Text>
        <Text weight="bold" size={36} color="#3F3D56" textAlign="center">
          {amount.format(wallet?.balance || 0)}
        </Text>
      </View>
      <View style={{ flex: 1, marginTop: 32 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text weight="bold" size={18} color="#3F3D56">
            Transaction History
          </Text>
          <View style={{ alignItems: "center", width: "100%" }}>
            <Image
              source={transaction}
              style={{ width: 200, height: 220, marginTop: 32 }}
              contentFit="contain"
            />
          </View>
        </ScrollView>
      </View>
      <View style={{ flexShrink: 0, padding: 16, gap: 24 }}>
        <Text textAlign="center" size={18} color="#707070">
          Your balance threshold is ₱-50.00
        </Text>
        <Cta onPress={handleTopup} color="#6366F1" textColor="#fff">
          Top-up Now
        </Cta>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  topupNotice: {
    backgroundColor: "#10B981",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 32,
  },
});
