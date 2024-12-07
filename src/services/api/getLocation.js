import axios from "axios";

export default async function getLocation(id) {
  const response = await axios
    .get(`https://passenger.pasahero.app/locations/user?id=${id}`)
    .catch((err) => {
      console.debug("🚀 ~ getLocation ~ err:", err);
      return null;
    });

  return response?.data;
}
