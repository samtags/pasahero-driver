import axios from "axios";
import log from "../log";

export default async function updateUser({ id, email, name }) {
  log.debug("Received request to update user.", { id, email, name });

  const response = await axios.put(
    "https://driver-93954675246.asia-southeast1.run.app/drivers",
    {
      id,
      email,
      name,
    },
  );

  console.debug("Update user request response.", response);

  return response.data;
}
