import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import WheelPicker from "@quidone/react-native-wheel-picker";
import Text from "@/src/components/text";
import * as controller from "@/src/services/controller";
import createProfile from "@/src/services/api/createProfile";
import storage from "@/src/services/storage";
import router from "@/src/services/router";

const options = [
  { label: "Angkas", value: "angkas" },
  { label: "JoyRide", value: "mc-taxi" },
  { label: "Move It", value: "moto-taxi" },
];

export default function Registration({ onClose = () => {} }) {
  const [selected, setSelected] = useState({
    label: "Angkas",
    value: "angkas",
  });

  const { isPending, mutateAsync } = useMutation({
    mutationFn: () => createProfile(selected.value),
  });

  async function handleSelect() {
    const response = await mutateAsync();

    if (response.id) {
      onClose();
      controller.handlePress();
      storage.set("user.service", selected.value);
      storage.set("user.profile_id", response.id);
      router.navigate({
        pathname: "/register",
        params: {
          id: response.id,
          status: "DRAFT",
          service: selected.value,
        },
      });
    } else {
      Alert.alert("Unable to create profile.", "Please try again later.", [
        {
          text: "Close",
          style: "default",
          onPress: () => onClose(),
        },
      ]);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity disabled={isPending} onPress={onClose}>
          <Text size={18} color="#707070">
            Isara
          </Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={isPending} onPress={handleSelect}>
          <Text size={18} weight="bold">
            Piliin
          </Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text color="#707070" size={18}>
            Platform
          </Text>
        </View>
      </View>
      <WheelPicker
        data={options}
        onValueChanging={(option) => {
          setSelected(option?.item);
        }}
        itemTextStyle={styles.itemTextStyle}
        style={styles.profileWheel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: "0",
    width: "100%",
    zIndex: 1,
  },
  header: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    position: "relative",
  },
  headerTitle: {
    position: "absolute",
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  profileWheel: {
    backgroundColor: "white",
    width: "100%",
    height: 280,
  },
  itemTextStyle: {
    fontFamily: "Lato-Regular",
  },
});
