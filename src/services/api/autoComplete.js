import axios from "axios";

/**
 *s
 * @param {string} input
 */
export default async function autoComplete(input) {
  console.debug("Using passenger.pasahero.app");
  return await axios.get(
    "https://passenger.pasahero.app/locations/autocomplete",
    {
      params: {
        q: input,
      },
    }
  );
}
