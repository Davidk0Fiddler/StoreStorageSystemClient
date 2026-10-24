import { GetProductSalesReport } from "./TopProductsService.js";
import { RenderTopProductsReport } from "../../ui/topProducts/TopProductsPanelUI.js";

export async function InitializeTopProductsFeature({ isCurrent = () => true } = {}) {
  const report = await GetProductSalesReport();
  if (isCurrent()) RenderTopProductsReport(report);
}
