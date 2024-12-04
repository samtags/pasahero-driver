import axios from "axios";
import log from "../log";

export default async function updateUser({ id, image_url, name }) {
  log.debug("Update user request", { id });

  const response = await axios.put(
    "https://passenger.pasahero.app/passengers",
    {
      id,
      image_url,
      name,
    }
  );

  return response.data;
}
