import axios from "@/src/services/axios";

export default async function getLocation(id) {
  const response = await axios
    .get(
      `https://passenger-93954675246.asia-southeast1.run.app/locations/user?id=${id}`,
    )
    .catch((err) => {
      console.debug("🚀 ~ getLocation ~ err:", err);
      return null;
    });

  return response?.data;
}
