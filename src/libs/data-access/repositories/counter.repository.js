/**
 * Repository for the Counter (POS / checkout) context.
 */

import { authJsonHeaders, requestJsonOrText, sendCommand } from "../http-client.js";

/**
 * Checks whether the requested quantity of a product can still be sold.
 *
 * @returns {Promise<any|string>} Availability payload, or the error text.
 */
export function isProductAvailableForCashier(requestBody) {
  return requestJsonOrText("/IsProductAvailableForCashier", {
    method: "POST",
    headers: authJsonHeaders(),
    body: JSON.stringify(requestBody),
  });
}

/** Persists a completed purchase. */
export function savePurchase(requestBody) {
  return sendCommand("/SavePurchase", {
    method: "POST",
    headers: authJsonHeaders(),
    body: JSON.stringify(requestBody),
  });
}