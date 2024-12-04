import { View as RNView } from "react-native";
import { createContext, useContext, useEffect, useState } from "react";
import get from "lodash.get";
import Store, { cachePrefix } from "./store";
import { UNSAFE_retrieveProperty } from "@/src/services/global";
import storage from "@/src/services/storage";
import JSON from "@/src/services/json";

const Context = createContext({});

export const useBitContext = (context) => useContext(context || Context);

export const usePropsByContext = (key, context) => {
  const { useProps: useProp } = useBitContext(context);
  return useProp?.(key);
};

const getContext = (name) => {
  const registry = UNSAFE_retrieveProperty("__BIT_REGISTRY__");
  const store = registry[name]?.state;
  return store?.__context__;
};

export const useProps = (key, defaultValue) => {
  let context;

  return usePropsByContext(key, context) || defaultValue;
};

export const getProps = (key, options) => {
  if (options?.context) {
    const registry = UNSAFE_retrieveProperty("__BIT_REGISTRY__");
    if (!registry) {
      return undefined;
    }
    const state = registry[options.context]?.state;
    return state?.[key];
  }
  return undefined;
};

export const useActionsByContext = (context) => {
  const { actions } = useBitContext(context);
  return actions;
};

export const getActions = (options) => {
  if (options?.context) {
    const registry = UNSAFE_retrieveProperty("__BIT_REGISTRY__");
    return registry?.[options.context]?.actions || {};
  }
  return {};
};

export const useActions = (options) => {
  let context;

  if (options) {
    if (options?.context) {
      const result = getContext(options.context);
      if (result) context = result;
    } else {
      context = options;
    }
  }

  return useActionsByContext(context);
};

export function createAccess(key) {
  return {
    useProps(propKey) {
      const registry = UNSAFE_retrieveProperty("__BIT_REGISTRY__");
      if (!registry?.[key]) return undefined;
      const prop = registry[key]?.ctx.useProps(propKey);
      if (prop) return prop;
      return undefined;
    },
    getProps(propKey) {
      const registry = UNSAFE_retrieveProperty("__BIT_REGISTRY__");
      if (!registry) {
        return undefined;
      }
      const state = registry[key]?.state;
      return state?.[String(propKey)];
    },
    useActions() {
      const registry = UNSAFE_retrieveProperty("__BIT_REGISTRY__");
      if (!registry) return {};
      return registry[key]?.actions;
    },
    getActions() {
      const registry = UNSAFE_retrieveProperty("__BIT_REGISTRY__");
      if (!registry) return {};
      const actions = registry[key]?.actions;
      return actions;
    },
    getAction(actionKey) {
      const registry = UNSAFE_retrieveProperty("__BIT_REGISTRY__");
      const actions = registry[key]?.actions;
      return actions?.[String(actionKey)];
    },
  };
}

const createBit = ({ Display, Actions, State, name, whitelistedStateKeys }) => {
  const ModelView = Actions;
  const View = Display;
  const Model = State || {};

  const Provider = Context;
  Model.__context__ = Provider;

  if (name) {
    Model.__name__ = name;
    Model.__whitelistedStateKeys__ = whitelistedStateKeys;
  }

  const initialStateReference = { ...Model };
  const store = new Store(Model);

  const usePropsHook = (key) => {
    const [hookState, setHookState] = useState(() => store.getState(key));

    useEffect(() => {
      const handler = (state) => {
        setHookState(get(state, key));
      };

      const rootKey = key.match(/^[^[\].]+/)?.[0] ?? key;

      const initialState = hookState;
      const onMountState = store.getState(key);

      if (initialState !== onMountState) {
        setHookState(onMountState);
      }

      store.subscribe(rootKey, handler);

      return () => {
        store.unsubscribe(handler);
      };
    }, []);

    return hookState;
  };

  const useActionsHook = (payload) => {
    const actions = payload;
    Object.keys(actions).forEach((key) => {
      store.setAction(key, actions[key]);
    });
    return null;
  };

  const getState = (key) => store.getState(key);

  const setState = (key, value) => store.setState(key, value);

  const useRegisterQuery = (key, query) => {
    const response = query();
    setState(key, response);
    return response;
  };

  const ConsumerProps = {
    useProps: usePropsHook,
    actions: store.actions,
  };

  const registry = UNSAFE_retrieveProperty("__BIT_REGISTRY__");

  const metadata = registry?.[name];

  if (metadata) {
    metadata.ctx = {
      useProps: usePropsHook,
    };
  }

  let ViewComponent;
  let WorkerComponent;

  if (View) {
    ViewComponent = View;
  } else {
    ViewComponent = function ViewComp({ children }) {
      return children;
    };
  }

  if (ModelView) {
    WorkerComponent = ModelView;
  }

  function BitBundlerComponent(props) {
    const { children, state, ...accessToProps } = props;
    const [isReady, setIsReady] = useState(false);

    async function componentWillMount() {
      const whitelist = initialStateReference.__whitelistedStateKeys__ || [];

      if (whitelist.length > 0) {
        const retrievedCachedData = whitelist.map((key) => {
          const cacheKey = `${cachePrefix}_${name}_${key}`;
          const cachedData = storage.getString(cacheKey) || "";
          return cachedData;
        });

        const cachedState = {};

        retrievedCachedData.forEach((data, index) => {
          try {
            const retrievedData = JSON.parse(data, undefined);
            if (retrievedData) {
              cachedState[whitelist[index]] = retrievedData;
            }
          } catch (err) {
            console.warn("Error parsing cached data", {
              error: err,
              key: whitelist[index],
              index,
              data,
            });
          }
        });

        Object.keys(cachedState).forEach((key) => {
          store.setState(key, cachedState[key]);
        });
      }

      Object.keys(Model).forEach((key) => {
        if (whitelist.includes(key)) return;
        store.setState(key, initialStateReference[key]);
      });

      if (state)
        Object.keys(state).forEach((key) => {
          store.setState(key, state[key]);
        });

      setIsReady(true);
    }

    useEffect(() => {
      componentWillMount();
    }, []);

    if (!isReady) return null;

    return (
      <Provider.Provider value={ConsumerProps}>
        <ViewComponent {...accessToProps}>{children}</ViewComponent>
        {ModelView && (
          <RNView style={{ display: "none" }}>
            <WorkerComponent
              useRegisterActions={useActionsHook}
              useRegisterQuery={useRegisterQuery}
              getState={getState}
              setState={setState}
              {...props}
            />
          </RNView>
        )}
      </Provider.Provider>
    );
  }

  return BitBundlerComponent;
};

export default createBit;
