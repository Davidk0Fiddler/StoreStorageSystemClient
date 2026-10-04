/**
 * Repository for the Authentication context.
 *
 * Bounded context: who may sign in, and what the resulting session is.
 */

import { getJson } from "../http-client.js";
import { saveSession } from "../session.js";

/**
 * Signs a user in.
 *
 * Unlike the other repositories this one throws on failure so the login page
 * can surface the backend's `errorMessage`.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<any>} Session payload (token, userName, roleName).
 * @throws {Error} When the credentials are rejected.
 */
export async function login(username, password) {
  const data = await getJson("/Login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  return data;
}

/**
 * Signs a user in and persists the resulting session.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<any>} Session payload.
 */
export async function loginAndPersist(username, password) {
  const session = await login(username, password);

  saveSession(session);

  return session;
}