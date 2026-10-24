import { LoadStocks } from "./features/StockFeature.js";
import { InitializeStockDocumentsFeature } from "../shared/stockDocuments/StockDocumentsFeature.js";
import { InitializeStockFilter } from "./ui/StockFilter.js";
import { RenderStockList } from "./ui/StockList.js";

import {
  ShowStockDetails,
  InitializeStockDetailsModal,
  OpenUpdateShopQuantityModal,
  InitializeStockShopQuantityModal,
} from "./ui/StockDetailsModal.js";

import {
  OpenUpdatePriceModal,
  InitializeStockPriceModal,
} from "./ui/StockPriceModal.js";

async function InitializeStockPanelPage() {
  document
    .getElementById("back-to-menu-button")
    ?.addEventListener("click", () => {
      window.location.href = "../LandingPage/LandingPage.html";
    });

  async function DisplayStocksPanel() {
    const stocks = await LoadStocks();

    if (stocks === null) return;
    RenderStockList(stocks, ShowStockDetails);
  }

  InitializeStockFilter(ShowStockDetails);
  InitializeStockDocumentsFeature(document);
  InitializeStockDetailsModal();
  InitializeStockPriceModal();
  window.OpenUpdateShopQuantityModal = OpenUpdateShopQuantityModal;
  InitializeStockShopQuantityModal();
  window.OpenUpdatePriceModal = OpenUpdatePriceModal;

  await DisplayStocksPanel();
}

if (window.__pageAccessAllowed === true) await InitializeStockPanelPage();
