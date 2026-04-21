/**
 * DATABASE MODULE - Simple in-memory store
 */

const store = new Map();

module.exports = {
  get: (key) => store.get(key),
  set: (key, value) => store.set(key, value),
  has: (key) => store.has(key),
  delete: (key) => store.delete(key),
  clear: () => store.clear(),
  keys: () => Array.from(store.keys()),
  values: () => Array.from(store.values()),
  entries: () => Array.from(store.entries())
};
