import { GetTransactionReport } from "./TransactionsService.js";
import { InitializeTransactionsPanelUI } from "../../ui/transactions/TransactionsPanelUI.js";

let disposePanel;

export function InitializeTransactionsFeature({ isCurrent = () => true } = {}) {
  disposePanel?.();
  disposePanel = InitializeTransactionsPanelUI({ getReport: GetTransactionReport, isCurrent });
}

export function DisposeTransactionsFeature() {
  disposePanel?.();
  disposePanel = null;
}
