import axios from "axios";
import storage from "@/src/services/storage";

export default async function getProfiles() {
  const id = storage.getString("user.id");

  if (!id) return [];

  const response = await axios.get(
    `https://driver-93954675246.asia-southeast1.run.app/profiles?id=${id}`,
  );

  return response?.data || [];
}
