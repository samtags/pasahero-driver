import axios from "axios";

export default async function getEstimate({ service, origin, destination }) {
  try {
    const res = await axios.get("https://passenger.pasahero.app/fare", {
      params: {
        service,
        origin,
        destination,
      },
    });

    return res?.data;
  } catch (error) {
    return null;
  }
}
