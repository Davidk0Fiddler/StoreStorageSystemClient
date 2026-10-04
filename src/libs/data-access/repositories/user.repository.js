/**
 * Repository for the User (administration) context.
 */

import {
  authJsonHeaders,
  getJson,
  requestJsonOrText,
  sendCommand,
} from "../http-client.js";

export function getAllUsers() {
  return getJson("/Users");
}

export function createUser(requestBody) {
  return sendCommand("/Users", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}

export function updateUser(requestBody) {
  return sendCommand("/Users", {
    method: "PUT",
    body: JSON.stringify(requestBody),
  });
}

export function activateUser(username) {
  return requestJsonOrText(`/Users/activate/${username}`, {
    headers: authJsonHeaders(),
  });
}

export function deactivateUser(username) {
  return requestJsonOrText(`/Users/deactivate/${username}`, {
    headers: authJsonHeaders(),
  });
}