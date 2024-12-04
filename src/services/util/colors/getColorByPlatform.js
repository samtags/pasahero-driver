export default function getColorByPlatform(platform) {
  switch (platform) {
    case "Angkas":
      return "#008DFE";
    case "JoyRide":
      return "#171ACB";
    case "Move It":
    case "Move it":
    case "MoveIt":
      return "#9B282D";

    default:
      return "#6366F1";
  }
}
