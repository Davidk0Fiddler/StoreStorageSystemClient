/**
 * Repository for the Product Type context.
 */

import {
  authJsonHeaders,
  getJson,
  requestJsonOrText,
  sendCommand,
} from "../http-client.js";

export function getAllProductTypes() {
  return getJson("/ProductType");
}

export function createProductType(requestBody) {
  return sendCommand("/ProductType", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}

export function updateProductType(requestBody) {
  return sendCommand(`/ProductType/${requestBody.Id}`, {
    method: "PUT",
    body: JSON.stringify(requestBody),
  });
}

export function activateProductType(productTypeId) {
  return requestJsonOrText(`/ProductType/activate/${productTypeId}`, {
    headers: authJsonHeaders(),
  });
}

export function deactivateProductType(productTypeId) {
  return requestJsonOrText(`/ProductType/deactivate/${productTypeId}`, {
    headers: authJsonHeaders(),
  });
}