import {
  GetTotalIncome,
  GetDailyIncome,
  GetWeeklyIncome,
  GetMonthlyIncome,
  GetYearlyIncome,
  GetPurchaseDetails,
} from "./IncomeService.js";
import {
  InitializeIncomePanelUI,
  DestroyActiveIncomeChart,
} from "../../ui/income/IncomePanelUI.js";
import { ShowPurchaseDetails } from "../../ui/income/PurchaseDetailsUI.js";

export async function OpenPurchaseDetails(id) {
  const shopLog = await GetPurchaseDetails(id);
  ShowPurchaseDetails(shopLog);
}

export function DisposeIncomeFeature() {
  DestroyActiveIncomeChart();
}

export function InitializeIncomeFeature({ isCurrent = () => true } = {}) {
  return InitializeIncomePanelUI({
    getTotalIncome: GetTotalIncome,
    getDailyIncome: GetDailyIncome,
    getWeeklyIncome: GetWeeklyIncome,
    getMonthlyIncome: GetMonthlyIncome,
    getYearlyIncome: GetYearlyIncome,
    openShopLogDetails: OpenPurchaseDetails,
    isCurrent,
  });
}
