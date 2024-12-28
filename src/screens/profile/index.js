import Text from "@/src/components/text";
import useOnFocus from "@/src/services/hooks/useOnFocus";
import useProfiles from "@/src/services/hooks/useProfiles";
import { radioOff, radioOn } from "@/src/services/images/remote";
import router from "@/src/services/router";
import handleGetPlatformByService from "@/src/services/util/trip/handleGetPlatformByService";
import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useMMKVString } from "react-native-mmkv";

export default function ProfileScreen() {
  const [activeProfileId] = useMMKVString("user.profile_id");
  const { data: profiles = [], refetch } = useProfiles();

  useOnFocus(() => {
    refetch();
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ padding: 16 }}>
        <Text color="#707070">Press to review your profile.</Text>
      </View>
      <View style={{ padding: 16 }}>
        {profiles?.map((profile) => (
          <Profile
            selected={activeProfileId === profile.id}
            platform={handleGetPlatformByService(profile.service)}
            brand={profile.vehicle_make}
            model={profile.vehicle_model}
            platenNumber={profile.vehicle_plate_number}
            color={profile.vehicle_color}
            firstName={profile.first_name}
            lastName={profile.last_name}
            img={profile.image_url}
            status={profile.status}
            showRadioButton
            onPress={() => {
              if (
                ["DRAFT", "PENDING", "DECLINED", "APPROVED"]?.includes(
                  profile?.status
                )
              ) {
                router.navigate({
                  pathname: "/register",
                  params: profile,
                });
              }
            }}
          />
        ))}
      </View>
    </View>
  );
}

export function Profile({
  selected = false,
  platform,
  brand,
  model,
  platenNumber,
  color,
  firstName,
  lastName,
  img,
  showRadioButton,
  onPress = () => {},
  status,
}) {
  let statusLabel = "";

  if (status === "DRAFT") {
    statusLabel = "— Not yet registered";
  } else if (status === "PENDING") {
    statusLabel = "— In review";
  } else if (status === "DECLINED") {
    statusLabel = "— Declined";
  } else if (status === "ACCEPTED") {
    statusLabel = "— Registered (Not yet verified)";
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={{ gap: 8 }}>
        <Text size={18} weight="bold">
          {platform} {statusLabel}
        </Text>
        <View style={styles.row}>
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              alignItems: "center",
              flex: 1,
            }}
          >
            <Image source={img} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} size={18} weight="bold">
                {platenNumber} — {color} {brand} {model}
              </Text>
              <Text>
                {firstName} {lastName}
              </Text>
            </View>
          </View>
          <View style={{ flexShrink: 0 }}>
            {showRadioButton && (
              <TouchableOpacity
                hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              >
                <Image
                  source={selected ? radioOn : radioOff}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: "gray",
    flexShrink: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 16,
  },
});
