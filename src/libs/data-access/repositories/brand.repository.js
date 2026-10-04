/**
 * Repository for the Brand context (product manufacturers).
 */

import {
  authJsonHeaders,
  getJson,
  requestJsonOrText,
  sendCommand,
} from "../http-client.js";

export function getAllBrands() {
  return getJson("/Brands");
}

export function createBrand(requestBody) {
  return sendCommand("/Brands", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}

export function updateBrand(requestBody) {
  return sendCommand(`/Brands/${requestBody.Id}`, {
    method: "PUT",
    body: JSON.stringify(requestBody),
  });
}

export function activateBrand(brandId) {
  return requestJsonOrText(`/Brands/activate/${brandId}`, {
    headers: authJsonHeaders(),
  });
}

export function deactivateBrand(brandId) {
  return requestJsonOrText(`/Brands/deactivate/${brandId}`, {
    headers: authJsonHeaders(),
  });
}