import storage from "../storage";

export default async function getToken(key) {
  return storage.getString(key);
}
