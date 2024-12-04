import axios from "axios";

/**
 *
 * @param {string} input
 */
export default async function grabAutoComplete(q) {
  return await axios.get(
    "https://maps-93954675246.asia-southeast2.run.app/grab-maps/autocomplete",
    {
      params: {
        q,
      },
    }
  );
}
