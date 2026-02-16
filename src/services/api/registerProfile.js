import axios from "@/src/services/axios";

export default async function registerProfile(id) {
  console.debug("Received register profile request.", id);

  const request = await axios.post(
    "https://driver-93954675246.asia-southeast1.run.app/profiles-register",
    { id },
  );

  if (request.status === 204) {
    return true;
  }

  return false;
}
