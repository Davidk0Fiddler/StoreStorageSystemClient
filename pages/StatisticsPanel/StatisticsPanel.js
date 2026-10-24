import { InitializeTopProductsFeature } from "./features/topProducts/TopProductsFeature.js";
import { InitializeBrandsFeature, DisposeBrandsFeature } from "./features/brands/BrandsFeature.js";
import { InitializeIncomeFeature, DisposeIncomeFeature } from "./features/income/IncomeFeature.js";
import { CreateIncomePanelMarkup } from "./ui/income/IncomePanelLayout.js";
import { CreateTopProductsPanelMarkup } from "./ui/topProducts/TopProductsPanelLayout.js";
import { CreateBrandsPanelMarkup } from "./ui/brands/BrandsPanelLayout.js";
import { CreateTransactionsPanelMarkup } from "./ui/legacy/TransactionsPanelLayout.js";
import { CreateVatPanelMarkup } from "./ui/legacy/VatPanelLayout.js";
import { InitializeTransactionsFeature, DisposeTransactionsFeature } from "./features/transactions/TransactionsFeature.js";
import { InitializeVatFeature, DisposeVatFeature } from "./features/vat/VatFeature.js";
import { RegisterStatisticsPanel, GetStatisticsPanel } from "./features/panelRegistry.js";
import {
  SetActiveStatisticsNavigation,
  InitializeStatisticsNavigation,
  ShowStatisticsPanelLoading,
  ShowStatisticsPanelError,
  MountStatisticsPanel,
} from "./ui/shared/StatisticsPanelUI.js";

let panelRequestId = 0;
let activePanelId = null;

/* ============================================================
   PANEL VÁLTÁS
   ============================================================ */

async function OpenPanel(panelId) {
  const requestId = ++panelRequestId;
  disposeActivePanel();
  SetActiveStatisticsNavigation(panelId);

  try {
    ShowStatisticsPanelLoading();
    const panel = GetStatisticsPanel(panelId);
    if (!panel) throw new Error(`Ismeretlen statisztikai panel: ${panelId}`);
    const html = panel.render();
    if (requestId !== panelRequestId) return;
    MountStatisticsPanel(html);
    activePanelId = panelId;
    await panel.mount({ isCurrent: () => requestId === panelRequestId });
    if (requestId !== panelRequestId) return;
  } catch (error) {
    if (requestId !== panelRequestId) return;
    disposeActivePanel();
    console.error(`Panel betöltési hiba (${panelId}):`, error);

    ShowStatisticsPanelError("A panel betöltése közben hiba történt.");
  }
}

function disposeActivePanel() {
  GetStatisticsPanel(activePanelId)?.unmount?.();
  activePanelId = null;
}

/* ============================================================
   NAVIGÁCIÓ
   ============================================================ */

async function InitializeStatisticsPage() {
  InitializeStatisticsNavigation(OpenPanel);

  RegisterStatisticsPanel("income-panel", {
    render: CreateIncomePanelMarkup,
    mount: InitializeIncomeFeature,
    unmount: DisposeIncomeFeature,
  });
  RegisterStatisticsPanel("top-products-panel", {
    render: CreateTopProductsPanelMarkup,
    mount: InitializeTopProductsFeature,
  });
  RegisterStatisticsPanel("brands-panel", {
    render: CreateBrandsPanelMarkup,
    mount: InitializeBrandsFeature,
    unmount: DisposeBrandsFeature,
  });
  RegisterStatisticsPanel("transactions-panel", {
    render: CreateTransactionsPanelMarkup,
    mount: InitializeTransactionsFeature,
    unmount: DisposeTransactionsFeature,
  });
  RegisterStatisticsPanel("vat-panel", {
    render: CreateVatPanelMarkup,
    mount: InitializeVatFeature,
    unmount: DisposeVatFeature,
  });

  await OpenPanel("income-panel");
  document.getElementById("back-to-menu-btn")?.addEventListener("click", () => {
    window.location.href = "../LandingPage/LandingPage.html";
  });
}

if (window.__pageAccessAllowed === true) await InitializeStatisticsPage();
