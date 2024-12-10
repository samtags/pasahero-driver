import { router, useNavigation } from "expo-router";
import { useState, useEffect } from "react";

const routerParams = new Map();
const listeners = new Map(); // { [key: string]: set<Function> }
if (process.env.NODE_ENV === "development") global.routerParams = routerParams;

function navigate({ pathname, params = {} }) {
  const key = pathname.split("/")?.at(-1);

  // safely update the params
  const existingParams = routerParams.get(key) || {};
  const data = { ...existingParams, ...params };

  set(key, data);

  router.navigate({ pathname: key, params: data });
}

function push({ pathname, params = {} }) {
  const key = pathname.split("/")?.at(-1);

  set(key, params);
  router.push({ pathname: key, params });
}

function replace({ pathname, params = {} }) {
  const key = pathname.split("/")?.at(-1);

  set(key, params);
  router.replace({ pathname: key, params });
}

function back() {
  router.back();
}

function resetParams(pathname) {
  const key = pathname.split("/")?.at(-1);
  routerParams.delete(key);
}

export default {
  navigate,
  replace,
  setParams,
  getState,
  push,
  back,
  resetParams,
};

export function useRouterParams() {
  const navigator = useNavigation();
  const state = navigator.getState();
  const route = state.routes[state.index];
  let routeName = route?.name?.split("/")?.at(-1);
  const [data, setData] = useState(routerParams.get(routeName));

  useEffect(() => {
    function onChange(payload) {
      console.debug("Received router params update", {
        key: routeName,
        payload,
      });

      setData(payload);
    }

    subscribe(routeName, onChange);
    return () => unsubscribe(routeName, onChange);
  }, []);

  return data;
}

export function setParams(pathname, params) {
  const key = pathname.split("/")?.at(-1);

  const existingParams = routerParams.get(key);

  set(key, {
    ...existingParams,
    ...params,
  });
}

export function getState(pathname) {
  const key = pathname.split("/")?.at(-1);

  return routerParams.get(key);
}

function set(pathname, data) {
  routerParams.set(pathname, data);

  listeners.get(pathname)?.forEach((callback) => {
    callback(data);
  });
}

function subscribe(key, callback) {
  console.debug("Subscribing to router params", key);

  if (!listeners.has(key)) {
    console.debug("Initializing listeners for router params", key);
    listeners.set(key, new Set());
  }

  listeners.get(key)?.add(callback);
  console.debug("Subscribed to router params", {
    key,
    size: listeners.get(key)?.size,
  });
}

function unsubscribe(key, callback) {
  console.debug("Unsubscribing from router params", key);
  listeners.get(key)?.delete(callback);
}
