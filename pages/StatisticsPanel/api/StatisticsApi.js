import { API_CALL } from "../../shared/ApiCaller.js";

function byDate(endpoint, date) {
  return API_CALL(`${endpoint}?date=${encodeURIComponent(date)}`, "GET");
}

function byRange(endpoint, from, to) {
  const query = new URLSearchParams();
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  const suffix = query.toString();
  return API_CALL(`Statistics/${endpoint}${suffix ? `?${suffix}` : ""}`, "GET");
}

export const StatisticsApi = Object.freeze({
  getTotalIncome: () => API_CALL("Statistics/total-income", "GET"),
  getDailyIncome: (date) => byDate("Statistics/daily-income", date),
  getWeeklyIncome: (date) => byDate("Statistics/weekly-income", date),
  getMonthlyIncome: (date) => byDate("Statistics/monthly-income", date),
  getYearlyIncome: (date) => byDate("Statistics/yearly-income", date),
  getProductSales: (from, to) => byRange("productpurchase", from, to),
  getBrandSales: (from, to) => byRange("brand-sales", from, to),
  getTransactions: (from, to, page = 1, pageSize = 50, type = "all") => {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize), type });
    if (from) query.set("from", from);
    if (to) query.set("to", to);
    return API_CALL(`Statistics/transactions?${query.toString()}`, "GET");
  },
  getVatReport: (from, to) => byRange("vat", from, to),
  getProducts: () => API_CALL("Products/listing", "GET"),
  getStocks: () => API_CALL("Stocks/listing", "GET"),
  getShopLog: (id) => API_CALL("Shoplogs", "GET", null, id),
});
