import axios from "axios";

/** @param {string} id  */
export default async function getWallet(id) {
  const response = await axios.get(
    `https://pasahero.passenger.app/wallet?passenger_id=${id}`
  );
  return response.data;
}
