/**
 * Repository for the Product context.
 *
 * Product images are uploaded as multipart form data, so the create/update
 * calls intentionally omit the JSON content type and pass the FormData through
 * untouched.
 */

import {
  authOnlyHeaders,
  authJsonHeaders,
  getJson,
  requestJsonOrFalse,
  requestJsonOrText,
  sendCommand,
} from "../http-client.js";

export function getAllProducts() {
  return getJson("/Products");
}

export function getProductsForListing() {
  return getJson("/Products/listing");
}

export function getProductsForCashier() {
  return getJson("/GetProductsForCashier");
}

/** Looks up a product by barcode. Resolves `false` when not found. */
export function getProductByBarcode(barcode) {
  return requestJsonOrFalse(`/Products/${barcode}`);
}

/** Looks up a product by SKU. Resolves the error text when not found. */
export function getProductBySku(sku) {
  return requestJsonOrText(`/Products/sku/${sku}`, {
    headers: authOnlyHeaders(),
  });
}

/** @param {FormData} formData Multipart payload including the product image. */
export function createProduct(formData) {
  return sendCommand("/Products", {
    method: "POST",
    headers: authOnlyHeaders(),
    body: formData,
  });
}

/** @param {FormData} formData Multipart payload including the product image. */
export function updateProduct(formData, sku) {
  return sendCommand(`/Products/${sku}`, {
    method: "PUT",
    headers: authOnlyHeaders(),
    body: formData,
  });
}

export function activateProduct(productSku) {
  return requestJsonOrText(`/Products/activate/${productSku}`, {
    headers: authJsonHeaders(),
  });
}

export function deactivateProduct(productSku) {
  return requestJsonOrText(`/Products/deactivate/${productSku}`, {
    headers: authJsonHeaders(),
  });
}