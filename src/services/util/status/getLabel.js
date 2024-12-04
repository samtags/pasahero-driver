export default function getLabel(status) {
  switch (status) {
    case "REQUESTED":
      return "Requested";
    case "FOUND":
      return "Assigned";
    case "ARRIVED":
      return "Arrived";
    case "STARTED":
      return "Departed";
    case "PASSENGER_CANCELED":
    case "DRIVER_CANCELED":
      return "Canceled";
    case "REQUEST_TIMEOUT":
      return "Timeout";
    case "DONE":
      return "Done";
    default:
      return "";
  }
}
