import Text from "@/src/components/text";
import useProfiles from "@/src/services/hooks/useProfiles";
import { radioOff, radioOn } from "@/src/services/images/remote";
import handleGetPlatformByService from "@/src/services/util/trip/handleGetPlatformByService";
import { Image } from "expo-image";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useMMKVString } from "react-native-mmkv";

export default function ProfileScreen() {
  const [activeProfileId] = useMMKVString("user.profile_id");
  const { data: profiles = [] } = useProfiles();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
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
          showRadioButton
        />
      ))}
    </View>
  );
}

function Profile({
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
}) {
  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text size={18} weight="bold">
        {platform}
      </Text>
      <View style={styles.row}>
        <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
          <Image source={img} style={styles.image} />
          <View>
            <Text numberOfLines={1} size={18} weight="bold">
              {platenNumber} — {color} {brand} {model}
            </Text>
            <Text>
              {firstName} {lastName}
            </Text>
          </View>
        </View>
        <View>
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
  );
}

const styles = StyleSheet.create({
  image: { width: 50, height: 50, borderRadius: 8, backgroundColor: "gray" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
