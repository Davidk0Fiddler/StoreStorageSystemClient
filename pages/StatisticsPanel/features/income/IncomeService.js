import { StatisticsApi } from "../../api/StatisticsApi.js";

async function query(request, failureMessage) {
  const response = await request;
  if (!response.success) throw new Error(failureMessage);
  return response.data;
}

export function GetTotalIncome() {
  return query(
    StatisticsApi.getTotalIncome(),
    "Nem sikerült lekérni az összesített bevételt.",
  );
}

export function GetDailyIncome(date) {
  return query(
    StatisticsApi.getDailyIncome(date),
    "Nem sikerült lekérni a napi bevételt.",
  );
}

export function GetWeeklyIncome(date) {
  return query(
    StatisticsApi.getWeeklyIncome(date),
    "Nem sikerült lekérni a heti bevételt.",
  );
}

export function GetMonthlyIncome(date) {
  return query(
    StatisticsApi.getMonthlyIncome(date),
    "Nem sikerült lekérni a havi bevételt.",
  );
}

export function GetYearlyIncome(date) {
  return query(
    StatisticsApi.getYearlyIncome(date),
    "Nem sikerült lekérni az éves bevételt.",
  );
}

export function GetPurchaseDetails(id) {
  return query(
    StatisticsApi.getShopLog(id),
    "Nem sikerült lekérni a vásárlás adatait.",
  );
}
