/**
 * Low level HTTP access to the backend API.
 *
 * Every network call in the application goes through this module. It owns:
 *   - the base URL (handed over from the main process via the preload bridge),
 *   - attaching the bearer token to authenticated requests,
 *   - the small set of response-handling conventions the UI relies on.
 *
 * IMPORTANT: the `...OrText` / `...OrFalse` helpers deliberately return the
 * raw error payload instead of throwing. The existing pages branch on the
 * return value (`if (response == true) { ... } else { showError(response) }`),
 * so throwing here would change application behaviour.
 */

import { getToken } from "./session.js";

function baseUrl() {
  return window.config.API_URL;
}

/** Headers for a JSON request that requires authentication. */
function authJsonHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

/** Headers for an authenticated request with no JSON content type (e.g. multipart uploads). */
function authOnlyHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
  };
}

/**
 * Performs a request and resolves the body as JSON.
 *
 * Note: this does not inspect the status code. It exists for the listing
 * endpoints whose pages consume the body regardless of the outcome.
 *
 * @param {string} path Path relative to the API root, e.g. "/Brands".
 * @param {object} [options]
 * @returns {Promise<any>} Parsed JSON body.
 */
export async function getJson(path, options = {}) {
  const response = await fetch(`${baseUrl()}${path}`, {
    method: options.method || "GET",
    headers: options.headers || authJsonHeaders(),
    body: options.body,
  });

  return await response.json();
}

/**
 * Performs a request and resolves `true` when the call succeeded, or the raw
 * response text when it failed. Used by every "Send..." command.
 *
 * @param {string} path
 * @param {object} [options]
 * @returns {Promise<true|string>}
 */
export async function sendCommand(path, options = {}) {
  const response = await fetch(`${baseUrl()}${path}`, {
    method: options.method || "POST",
    headers: options.headers || authJsonHeaders(),
    body: options.body,
  });

  if (response.ok) {
    return true;
  }

  return await response.text();
}

/**
 * Performs a request that resolves the JSON body on success and the raw error
 * text on failure.
 *
 * @param {string} path
 * @param {object} [options]
 * @returns {Promise<any|string>}
 */
export async function requestJsonOrText(path, options = {}) {
  const response = await fetch(`${baseUrl()}${path}`, {
    method: options.method || "GET",
    headers: options.headers || authJsonHeaders(),
    body: options.body,
  });

  if (response.ok) {
    return await response.json();
  }

  return await response.text();
}

/**
 * Performs a request for the statistics endpoints.
 *
 * These validate the response and throw with the serialised `errors` array so
 * the statistics panel can render a readable message.
 *
 * @param {string} path
 * @param {object} [options]
 * @returns {Promise<any>}
 * @throws {Error} When the backend responds with a non-2xx status.
 */
export async function requestValidatedJson(path, options = {}) {
  const response = await fetch(`${baseUrl()}${path}`, {
    method: options.method || "GET",
    headers: options.headers || authJsonHeaders(),
    body: options.body,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data === "string" ? data : JSON.stringify(data.errors, null, 2),
    );
  }

  return data;
}

/**
 * Looks up a resource and resolves `false` when the backend reports not-found.
 *
 * @param {string} path
 * @param {object} [options]
 * @returns {Promise<any|false>}
 */
export async function requestJsonOrFalse(path, options = {}) {
  const response = await fetch(`${baseUrl()}${path}`, {
    method: options.method || "GET",
    headers: options.headers || authJsonHeaders(),
    body: options.body,
  });

  if (!response.ok) {
    return false;
  }

  return await response.json();
}

export { authJsonHeaders, authOnlyHeaders };