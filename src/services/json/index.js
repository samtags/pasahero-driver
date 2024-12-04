export function parse(data, defaultValue) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
}

export function stringify(data) {
  try {
    return JSON.stringify(data);
  } catch (e) {
    return "";
  }
}

export default {
  parse,
  stringify,
};
