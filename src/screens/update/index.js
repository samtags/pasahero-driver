import { Linking, Platform, TouchableOpacity, View } from "react-native";
import Text from "../../components/text";
import { StatusBar } from "expo-status-bar";
import { useFeatureValue } from "@growthbook/growthbook-react";
import storage from "../../services/storage";
import * as Updates from "expo-updates";
import log from "../../services/log";

export default function Update() {
  const googlePlayUrl = useFeatureValue("php-google-play-url", "");
  const appStoreUrl = useFeatureValue("php-app-store-url", "");

  let url = googlePlayUrl;

  if (Platform.OS === "ios") {
    url = appStoreUrl;
  }

  const onPressUpdate = () => {
    const isUpdateAvailable = storage.getBoolean("app.updateAvailable");
    if (isUpdateAvailable === true) {
      Updates.reloadAsync()
        .catch((err) => {
          log.debug("Error while updating the app.", { error: err });
        })
        .finally(() => {
          storage.set("app.updateAvailable", false);
          log.debug("Update completed.");
        });
      return;
    }

    log.debug("Redirecting to the store.", { url });

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        log.debug("Unable to open the store link", { url });
      }
    });

    storage.set("app.updateAvailable", false);
  };

  return (
    <>
      <StatusBar />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "white",
          padding: 24,
          gap: 4,
        }}
      >
        <Text size={32} color="#1B1B1B">
          Update
        </Text>
        <Text style={{ maxWidth: 380 }} textAlign="justified" color="#707070">
          ˌəp-ˈdāt
        </Text>

        <View style={{ marginTop: 8 }} />

        <Text style={{ maxWidth: 380 }} textAlign="justified" color="#707070">
          to bring (a book, figures, or the like) up to date as by adding new
          information or making corrections
        </Text>

        <View style={{ marginTop: 24 }} />

        <TouchableOpacity onPress={onPressUpdate}>
          <Text
            style={{ maxWidth: 380, textDecorationLine: "underline" }}
            textAlign="justified"
            color="#707070"
          >
            Update now!
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
