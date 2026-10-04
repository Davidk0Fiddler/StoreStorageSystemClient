/**
 * Repository for the Statistics (reporting) context.
 *
 * These endpoints validate the response and throw on failure so the panel can
 * display the backend's validation messages.
 */

import { authOnlyHeaders, requestJsonOrText, requestValidatedJson } from "../http-client.js";

export function getTotalIncome() {
  return requestValidatedJson("/Statistics/total-income");
}

export function getDailyIncome(date) {
  return requestValidatedJson(`/Statistics/daily-income?date=${date}`);
}

export function getWeeklyIncome(date) {
  return requestValidatedJson(`/Statistics/weekly-income?date=${date}`);
}

export function getMonthlyIncome(date) {
  return requestValidatedJson(`/Statistics/monthly-income?date=${date}`);
}

export function getYearlyIncome(date) {
  return requestValidatedJson(`/Statistics/yearly-income?date=${date}`);
}

export function getProductPurchaseStats() {
  return requestValidatedJson("/Statistics/productpurchase");
}

/** Reads a single shop log entry (receipt). */
export function getShopLogById(id) {
  return requestJsonOrText(`/Shoplogs/${id}`, {
    headers: authOnlyHeaders(),
  });
}