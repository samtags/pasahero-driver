import { router, useNavigation } from "expo-router";

const routerParams = new Map();
global.routerParams = routerParams;

function navigate({ pathname, params = {} }) {
  let key = pathname;
  if (key[0] === "/") key = key.slice(1);

  routerParams.set(key, params);
  router.navigate({ pathname: key, params });
}

function push({ pathname, params = {} }) {
  let key = pathname;
  if (key[0] === "/") key = key.slice(1);

  routerParams.set(key, params);
  router.push({ pathname: key, params });
}

function replace({ pathname, params = {} }) {
  let key = pathname;
  if (key[0] === "/") key = key.slice(1);

  routerParams.set(key, params);
  router.replace({ pathname: key, params });
}

function back() {
  router.back();
}

export default {
  navigate,
  replace,
  setParams,
  getState,
  push,
  back,
};

export function useRouterParams() {
  const navigator = useNavigation();
  const state = navigator.getState();
  const route = state.routes[state.index];

  let routeName = route?.name;

  // check if routeName starts with '/'
  // remove trailing '/'
  if (routeName[0] === "/") routeName = routeName.slice(1);

  return routerParams.get(routeName);
}

export function setParams(pathname, params) {
  let key = pathname;
  if (key[0] === "/") key = key.slice(1);

  const existingParams = routerParams.get(key);

  routerParams.set(key, {
    ...existingParams,
    ...params,
  });
}

export function getState(pathname) {
  let key = pathname;
  if (key[0] === "/") key = key.slice(1);

  return routerParams.get(key);
}
