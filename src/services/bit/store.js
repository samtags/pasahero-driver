import get from "lodash.get";
import set from "lodash.set";
import storage from "@/src/services/storage";

export const cachePrefix = "BIT_CACHE";

export default class Store {
  constructor(state) {
    this.state = state;
    this.listeners = new Map();
    this.subscriptionLookup = new Map();
    this.subscriptions = {};
    this.actions = {};
    this.ws = null;
    this.name = state.__name__ || Store.generateKey();

    this.handleRestoreCachedState();
  }

  getState(key) {
    return get(this.state, key);
  }

  setState(key, value) {
    this.state = set(this.state, key, value);

    this.subscriptions?.[key]?.forEach((handler) => {
      handler(this.state);
    });

    this.handleCacheState(key, value);
    this.handleInformDebuggerOnStateChange(key, value);

    return value;
  }

  setAction(key, callback) {
    this.actions[key] = callback;
    this.handleInformDebuggerOnMethodUpdate(key, callback.toString());
  }

  subscribe(key, handler) {
    this.subscriptionLookup.set(handler, key);

    if (!this.subscriptions[key]) {
      this.subscriptions[key] = new Set();
    }

    this.subscriptions[key].add(handler);
  }

  unsubscribe(handler) {
    const key = this.subscriptionLookup.get(handler);
    if (key) {
      this.subscriptions[key].delete(handler);
      this.subscriptionLookup.delete(handler);
    }
  }

  static generateKey() {
    const characters = "0123456789abcdef";
    let uuid = "";

    for (let i = 0; i < 32; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uuid += characters[randomIndex];
    }

    uuid = `${uuid.substring(0, 8)}-${uuid.substring(8, 12)}-${uuid.substring(
      12,
      16
    )}-${uuid.substring(16, 20)}-${uuid.substring(20)}`;

    return uuid;
  }

  handleInformDebuggerOnStateChange(key, value) {
    if (process.env.NODE_ENV === "development") {
      try {
        const data = JSON.stringify(
          {
            appName: "JoyRide",
            name: this.name,
            payload: { key, value },
            type: "stateChange",
          },
          Store.getCircularReplacer()
        );

        this.ws?.send(data);
      } catch (err) {
        // Handle error silently
      }
    }
  }

  handleInformDebuggerOnMethodUpdate(key, value) {
    if (process.env.NODE_ENV === "development") {
      try {
        const data = JSON.stringify(
          {
            appName: "JoyRide",
            name: this.name,
            payload: { key, value },
            type: "methodUpdate",
          },
          Store.getCircularReplacer()
        );

        this.ws?.send(data);
      } catch (err) {
        // Handle error silently
      }
    }
  }

  sendStoreState() {
    try {
      const data = JSON.stringify(
        {
          appName: "JoyRide",
          name: this.name,
          payload: this.state,
          type: "initialState",
        },
        Store.getCircularReplacer()
      );

      this.ws?.send(data);
    } catch (err) {
      console.log("Error sending store state:", err);
    }
  }

  sendStoreActions() {
    const payload = {};

    Object.keys(this.actions).forEach((key) => {
      payload[key] = this.actions[key].toString();
    });

    const data = JSON.stringify(
      {
        appName: "JoyRide",
        name: this.name,
        payload,
        type: "methods",
      },
      Store.getCircularReplacer()
    );

    this.ws?.send(data);
  }

  handleCacheState(key, value) {
    const whitelist = this.state.__whitelistedStateKeys__ || [];
    const cacheKey = `${cachePrefix}_${this.name}_${key}`;

    if (whitelist.includes(key)) {
      storage.set(cacheKey, JSON.stringify(value));
    }
  }

  async handleRestoreCachedState() {
    const whitelist = this.state.__whitelistedStateKeys__ || [];
    const retrievedCachedData = whitelist.map((key) => {
      const cacheKey = `${cachePrefix}_${this.name}_${key}`;
      return storage.getString(cacheKey) || "";
    });

    const cachedState = {};

    retrievedCachedData.forEach((data, index) => {
      try {
        cachedState[whitelist[index]] = JSON.parse(data);
      } catch (err) {
        // Handle error silently
      }
    });

    Object.keys(cachedState).forEach((key) => {
      this.setState(key, cachedState[key]);
    });
  }

  static getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  }
}
