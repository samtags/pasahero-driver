export default function getStrokeColorByPlatform(platform) {
  switch (platform) {
    case "Angkas":
      return "#0066FF";
    case "JoyRide":
      return "#2E31F5";
    case "Move It":
    case "Move it":
    case "MoveIt":
      return "#7D0005";

    default:
      return "#373BF4";
  }
}
