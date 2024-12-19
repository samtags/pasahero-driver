import { useMMKVString } from "react-native-mmkv";
import {
  motorAngkasIcon,
  motorJoyRideIcon,
  motorMoveItIcon,
  defaultIcon,
} from "@/src/services/images/remote";

export default function useDriverIcon() {
  const [service] = useMMKVString("user.service");
  const [status] = useMMKVString("controller.status");

  let icon = defaultIcon;

  if (status === "ACTIVE") {
    if (service === "mc-taxi") icon = motorJoyRideIcon;
    if (service === "moto-taxi") icon = motorMoveItIcon;
    if (service === "angkas") icon = motorAngkasIcon;
  }

  return icon;
}
