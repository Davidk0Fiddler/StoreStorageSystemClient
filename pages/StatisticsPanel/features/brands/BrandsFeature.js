import { GetBrandSalesReport } from "./BrandService.js";
import { InitializeBrandsPanelUI } from "../../ui/brands/BrandsPanelUI.js";

let disposePanel;

export function InitializeBrandsFeature({ isCurrent = () => true } = {}) {
  disposePanel?.();
  disposePanel = InitializeBrandsPanelUI({ getReport: GetBrandSalesReport, isCurrent });
}

export function DisposeBrandsFeature() {
  disposePanel?.();
  disposePanel = null;
}
