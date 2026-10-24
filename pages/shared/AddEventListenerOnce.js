const registeredListeners = new WeakMap();

export function AddEventListenerOnce(target, eventName, listener, key = eventName) {
  if (!target || typeof target.addEventListener !== "function") return false;

  let keys = registeredListeners.get(target);
  if (!keys) {
    keys = new Set();
    registeredListeners.set(target, keys);
  }

  const registrationKey = `${eventName}:${key}`;
  if (keys.has(registrationKey)) return false;

  target.addEventListener(eventName, listener);
  keys.add(registrationKey);
  return true;
}
