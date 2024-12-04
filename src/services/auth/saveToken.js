import storage from "../storage";

export default async function setToken(key, value) {
  storage.set(key, value);
}
