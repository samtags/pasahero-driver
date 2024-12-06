import axios from "axios";
import storage from "@/src/services/storage";

export default async function getProfiles() {
  const id = storage.getString("user.id");

  const response = await axios.get(
    `https://driver.pasahero.app/profiles?id=${id}`
  );

  return response?.data || [];
}
