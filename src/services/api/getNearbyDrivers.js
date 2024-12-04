import axios from "axios";
import log from "@/src/services/log";

export default async function getNearbyDrivers(latitude, longitude) {
  const services = ["mc-taxi", "angkas", "moto-taxi"];

  let url = `https://passenger.pasahero.app/nearby-drivers?coordinates=${latitude},${longitude}`;
  services.forEach((service) => {
    url += `&services=${service}`;
  });

  const req = await axios.get(url).catch((err) => {
    log.debug("Unable to get nearby drivers", { error: err });
    return { data: [] };
  });

  log.debug("[Network] Nearby drivers retrieved.", { url, data: req.data }); // prettier-ignore

  return req.data;
}
