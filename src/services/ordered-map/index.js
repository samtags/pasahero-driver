export default class OrderedMap {
  /** @type {Set} */
  #order = undefined;

  /** @type {Map} */
  #map = undefined;

  constructor() {
    this.#order = new Set();
    this.#map = new Map();
  }

  /** @param {string} key @param {any} value */
  addToEnd(key, value) {
    this.#order.add(key);
    this.#map.set(key, value);
  }

  /** @param {string} key */
  remove(key) {
    this.#order.delete(key);
    this.#map.delete(key);
  }

  /** @param {string} key */
  get(key) {
    return this.#map.get(key);
  }

  /** @param {(key: string, value: any) => void} callback */
  forEach(callback) {
    this.#order.forEach((key) => {
      callback(key, this.#map.get(key));
    });
  }

  /** @param {(key: string, value: any) => []} callback */
  map(callback) {
    const result = [];

    this.#order.forEach((key) => {
      result.push(callback(key, this.#map.get(key)));
    });

    return result;
  }

  size() {
    return this.#order.size;
  }
}
