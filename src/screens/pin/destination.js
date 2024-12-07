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
import handleSetDestination from "@/src/services/util/trip/handleSetDestination";
import router, { useRouterParams } from "@/src/services/router";

export default function PinDestination() {
  const payload = useRouterParams();
  const isFromMatchRequest = Boolean(payload?.isFromMatchRequest);

  const { isKeyboardVisible, latitude, longitude, title, subTitle } =
    useContext(Context);

  const handleConfirm = async () => {
    const payload = {
      latitude: latitude,
      longitude: longitude,
      shortAddress: title,
      longAddress: subTitle,
    };

    handleSetDestination(payload);

    console.debug("called", payload);
    if (isFromMatchRequest) {
      router.navigate({
        pathname: "/request",
      });
    } else {
      console.debug("Redirecting to origin screen");
      router.navigate({
        pathname: "/origin",
        params: JSON.parse(storage.getString("location.current"), {}),
      });
    }

    log.info("User confirmed the drop-off location.", {
      actionType: "tap",
      payload,
    });
  };

  useOnFocus(() => {
    log.debug("User is in the drop-off pin location screen.");
  });

  return (
    <View style={{ flex: 1 }}>
      <Map />
      <Control indicatorType="to" placeholder="Search drop-off location" />
      <Optional condition={isKeyboardVisible === false}>
        <Info title={title} subTitle={subTitle} onConfirm={handleConfirm} />
      </Optional>
    </View>
  );
}
