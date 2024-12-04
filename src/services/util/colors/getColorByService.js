export default function getColorByService(service) {
  switch (service) {
    case "angkas":
      return "#008DFE";
    case "mc-taxi":
      return "#171ACB";
    case "moto-taxi":
      return "#9B282D";

    default:
      return "#6366F1";
  }
}
