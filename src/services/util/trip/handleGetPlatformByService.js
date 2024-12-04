export default function handleGetPlatformByService(service) {
  switch (service) {
    case "angkas":
      return "Angkas";
    case "mc-taxi":
      return "JoyRide";
    case "moto-taxi":
      return "Move It";

    default:
      return undefined;
  }
}
