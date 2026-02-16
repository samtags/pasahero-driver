import axios from "@/src/services/axios";

export default async function getEstimate({ service, origin, destination }) {
  try {
    const res = await axios.get("https://estimate-2h6pkmfalq-et.a.run.app", {
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
