import axios from "axios";

export default async function registerProfile(id) {
  console.info("Received register profile request.", id);

  const request = await axios.post(
    "https://driver.pasahero.app/profiles-register",
    { id }
  );

  if (request.status === 204) {
    return true;
  }

  return false;
}
