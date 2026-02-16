import axios from "axios";
import log from "@/src/services/log";

const client = axios.create({});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const config = error?.config || {};

    log.debug("[API ERROR] Error received from API call");
    log.debug("Request details:", {
      url: config.url,
      baseURL: config.baseURL,
      method: config.method,
      headers: config.headers,
      params: config.params,
      data: config.data,
      timeout: config.timeout,
    });

    if (error?.response) {
      log.debug("Error status:", error.response.status);
      log.debug("Error response:", error.response.data);
    } else {
      log.debug("Error status:", "NO_RESPONSE");
      log.debug("Error response:", error?.message);
    }

    return Promise.reject(error);
  },
);

export default client;
