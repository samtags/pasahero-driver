import axios from "axios";
import storage from "@/src/services/storage";

export default async function topUp({ reference, amount, screenshot }) {
  const driver_id = storage.getString("user.id");
  const response = await axios.post(
    "https://driver-93954675246.asia-southeast1.run.app/wallet/top-up",
    {
      reference,
      amount: Number(amount),
      screenshot,
      driver_id,
    },
  );

  return response;
}
