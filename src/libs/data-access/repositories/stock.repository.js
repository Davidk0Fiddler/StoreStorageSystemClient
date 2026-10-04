/**
 * Repository for the Stock context.
 */

import { getJson, sendCommand } from "../http-client.js";

export function getAllStocks() {
  return getJson("/Stocks");
}

export function getStocksForListing() {
  return getJson("/Stocks/listing");
}

export function getStockById(id) {
  return getJson(`/Stocks/${id}`);
}

/** Lists stocks that are about to expire. */
export function getExpiringStocks() {
  return getJson("/Stocks/ExpirationCheck");
}

/** Records newly received goods. */
export function addStock(requestBody) {
  return sendCommand("/AddStock", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });
}

export function updateStock(requestBody) {
  return sendCommand("/Stocks", {
    method: "PUT",
    body: JSON.stringify(requestBody),
  });
}

export function updateStockPrice(requestBody) {
  return sendCommand("/Stocks/price", {
    method: "PUT",
    body: JSON.stringify(requestBody),
  });
}

export function updateStockShopQuantity(requestBody) {
  return sendCommand("/Stocks/shopquantity", {
    method: "PUT",
    body: JSON.stringify(requestBody),
  });
}