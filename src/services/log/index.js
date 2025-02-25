import storage from "@/src/services/storage";

const headers = new Headers();
headers.append("Api-Key", process.env.EXPO_PUBLIC_NEW_RELIC_KEY);
headers.append("Content-Type", "application/json");

const options = {
  method: "POST",
  headers,
  redirect: "follow",
};

function log(message, ...arg) {
  // implementing log structure
  // https://www.notion.so/pasahero/Log-coherence-83cf75228e014d5289e757b40a4697bc?pvs=4

  let payload = {};

  payload.level = payload.level || "debug";
  payload.message = payload?.message || message;
  payload.created_at = new Date().toISOString();
  payload.context = payload.context || {};
  payload.context["@service_name"] = "com.pasahero.driver";
  payload.context["@version"] = "1.1.2";
  payload.context["@environment"] = process.env.NODE_ENV;
  payload.context["@user_id"] = storage.getString("user.id");
  payload.extras = arg;

  const body = JSON.stringify(payload);
  options.body = body;

  // todo: remove new relic once we have centralized the logging service
  fetch("https://log-api.newrelic.com/log/v1", options);
  // fetch("https://asia-southeast2-pasahero-5c989.cloudfunctions.net/log/", options); // prettier-ignore
}

const debug = console.debug;
console.debug = function (...args) {
  log(args[0], ...args.slice(1));
  debug(...args);
};

const info = console.info;
console.info = function (...args) {
  info(...args);
  log(args[0], ...args.slice(1));
};

const warn = console.warn;
console.warn = function (...args) {
  warn(...args);
  log(args[0], ...args.slice(1));
};

const error = console.error;
console.error = function (...args) {
  error(...args);
  log(args[0], ...args.slice(1));
};

export default {
  debug: (message, payload = {}) => log(message, { ...payload, level: "debug" }), // prettier-ignore
  info: (message, payload = {}) => log(message, { ...payload, level: "info" }),
  warn: (message, payload = {}) => log(message, { ...payload, level: "warn" }),
  error: (message, payload = {}) => log(message, { ...payload, level: "error" }), // prettier-ignore
};
