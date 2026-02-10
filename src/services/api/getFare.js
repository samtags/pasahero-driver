import axios from "axios";

export default async function getEstimate({ service, origin, destination }) {
  try {
    const res = await axios.get(
      "https://passenger-93954675246.asia-southeast1.run.app/fare",
      {
        params: {
          service,
          origin,
          destination,
        },
      },
    );

    return res?.data;
  } catch (error) {
    return null;
  }
}
