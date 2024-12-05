import axios from "axios";
import log from "../log";

export default async function updateUser({ id, email, name }) {
  log.debug("Received request to update user.", { id, email, name });

  const response = await axios.put("https://driver.pasahero.app/drivers", {
    id,
    email,
    name,
  });

  console.log("Update user request response.", response);

  return response.data;
}
