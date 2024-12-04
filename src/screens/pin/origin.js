import { View } from "react-native";
import { useContext } from "react";
import Map from "./component/Map";
import Info from "./component/Info";
import Control from "./component/Control";
import Optional from "@/src/components/optional";
import { Context } from "./component/Provider";
import storage from "@/src/services/storage";
import JSON from "@/src/services/json";
import log from "@/src/services/log";
import useOnFocus from "@/src/services/hooks/useOnFocus";
import router from "@/src/services/router";
import { handleSetOrigin } from "@/src/services/util/trip/handleSetOrigin";

export default function FirstLastLocation() {
  const { isKeyboardVisible, latitude, longitude, title, subTitle } =
    useContext(Context);

  const handleConfirm = async () => {
    const payload = {
      latitude: latitude,
      longitude: longitude,
      shortAddress: title,
      longAddress: subTitle,
    };

    handleSetOrigin(payload);

    router.replace({ pathname: "/request" });

    storage.set("location.current", JSON.stringify(payload));

    log.info("User confirmed the pickup location.", {
      actionType: "tap",
      payload,
    });
  };

  useOnFocus(() => {
    log.debug("User is in the pickup pin location screen.");
  });

  return (
    <View style={{ flex: 1 }}>
      <Map />
      <Control indicatorType="from" placeholder="Search pickup location" />
      <Optional condition={isKeyboardVisible === false}>
        <Info title={title} subTitle={subTitle} onConfirm={handleConfirm} />
      </Optional>
    </View>
  );
}
