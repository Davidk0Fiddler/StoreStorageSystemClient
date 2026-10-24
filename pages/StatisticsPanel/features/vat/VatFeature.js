import { GetVatReport } from "./VatService.js";
import { InitializeVatPanelUI } from "../../ui/legacy/VatPanelUI.js";

let disposePanel;

export function InitializeVatFeature({ isCurrent = () => true } = {}) {
  disposePanel?.();
  disposePanel = InitializeVatPanelUI({ getReport: GetVatReport, isCurrent });
}

export function DisposeVatFeature() {
  disposePanel?.();
  disposePanel = null;
}
