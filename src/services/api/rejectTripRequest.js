import axios from "axios";

export default async function rejectTripRequest(id) {
  console.debug("Received reject trip request", { id });

  const config = {
    method: "delete",
    url: "https://driver.pasahero.app/take-trip",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({ id }),
  };

  await axios(config);
  console.log("Rejected trip request success!", { id });
}
