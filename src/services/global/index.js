import log from "@/src/services/log";

export const UNSAFE_registerProperty = (key, value) => {
  if (global[key]) {
    log.debug(`Overwriting existing property. [PROPERTY_NAME]: ${key}`);
  }
  global[key] = value;
};

export const UNSAFE_registerMethod = (key, handler) => {
  if (global[key]) {
    log.debug(`Overwriting existing method. [METHOD_NAME]: ${key}`);
  }
  global[key] = handler;
};

export const UNSAFE_retrieveProperty = (key) => global?.[key];

export const UNSAFE_run = (key) => global?.[key]?.();

export const UNSAFE_removeProperty = (key) => {
  delete global?.[key];
};
