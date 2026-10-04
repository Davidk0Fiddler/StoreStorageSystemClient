/**
 * Repository for the Product Size context (e.g. 500 g, 1 kg).
 */

import {
  authJsonHeaders,
  getJson,
  requestJsonOrText,
  sendCommand,
} from "../http-client.js";

export function getAllProductSizes() {
  return getJson("/ProductSize");
}

export function createProductSize(requestBody) {
  return sendCommand("/ProductSize", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}

export function updateProductSize(requestBody) {
  return sendCommand(`/ProductSize/${requestBody.Id}`, {
    method: "PUT",
    body: JSON.stringify(requestBody),
  });
}

export function activateProductSize(productSizeId) {
  return requestJsonOrText(`/ProductSize/activate/${productSizeId}`, {
    headers: authJsonHeaders(),
  });
}

export function deactivateProductSize(productSizeId) {
  return requestJsonOrText(`/ProductSize/deactivate/${productSizeId}`, {
    headers: authJsonHeaders(),
  });
}