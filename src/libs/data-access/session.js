/**
 * Session storage access for the authenticated user.
 *
 * The renderer keeps the JWT and the identity of the logged-in user in
 * `sessionStorage`, so the data lives only as long as the window does.
 * Centralising the keys here means the string literals ("token", "userName",
 * "roleName") exist in exactly one place.
 */

const TOKEN_KEY = "token";
const USER_NAME_KEY = "userName";
const ROLE_NAME_KEY = "roleName";

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getUserName() {
  return sessionStorage.getItem(USER_NAME_KEY);
}

export function getRoleName() {
  return sessionStorage.getItem(ROLE_NAME_KEY);
}

/**
 * Persists a successful login response.
 *
 * @param {{ token: string, userName: string, roleName: string }} session
 */
export function saveSession({ token, userName, roleName }) {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_NAME_KEY, userName);
  sessionStorage.setItem(ROLE_NAME_KEY, roleName);
}

/** Clears every value belonging to the current session (logout). */
export function clearSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_NAME_KEY);
  sessionStorage.removeItem(ROLE_NAME_KEY);
}