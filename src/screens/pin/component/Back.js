import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { back } from "@/src/services/images/remote";
import log from "@/src/services/log";

export default function Back() {
  const router = useRouter();

  const handleOnPressBack = () => {
    log.debug("User tapped the back button.", { actionType: "tap" });
    router.back();
  };

  return (
    <TouchableOpacity onPress={handleOnPressBack}>
      <Image
        style={{ width: 72, height: 72, marginTop: -15, marginLeft: -14 }}
        cachePolicy="memory-disk"
        source={back}
      />
    </TouchableOpacity>
  );
}
