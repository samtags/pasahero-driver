import axios from "axios";

export default async function updateProfile(id, data) {
  console.debug("Received update profile request.", id, data);

  const allowedKeys = [
    "first_name",
    "last_name",
    "vehicle_make",
    "vehicle_model",
    "vehicle_year",
    "vehicle_color",
    "vehicle_transmission",
    "vehicle_plate_number",
    "vehicle_image_front",
    "vehicle_image_back",
    "vehicle_image_side",
    "image_url",
    "proof_url",
    "status",
    "mobile_number",
  ];

  const payload = Object.keys(data).reduce((acc, key) => {
    if (allowedKeys.includes(key)) {
      acc[key] = data[key];
    }
    return acc;
  }, {});

  payload.id = id;

  const request = await axios.patch("https://driver.pasahero.app/profiles", payload); // prettier-ignore

  if (request.status === 204) {
    console.debug("Profile updated successfully.", id, payload);
    return true;
  }

  return false;
}
