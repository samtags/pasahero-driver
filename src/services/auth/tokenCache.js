import storage from "../storage";

export default {
  getToken: (key) => storage.getString(key),
  saveToken: (key, value) => storage.set(key, value),
  clearToken: (key) => storage.delete(key),
};
