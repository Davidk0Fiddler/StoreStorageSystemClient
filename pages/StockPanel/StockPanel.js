import { LoadStocks } from "./features/StockFeature.js";
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

document
  .getElementById("back-to-menu-button")
  ?.addEventListener("click", () => {
    window.location.href = "../LandingPage/LandingPage.html";
  });

async function DisplayStocksPanel() {
  const stocks = await LoadStocks();

  if (stocks === null) {
    return;
  }

  RenderStockList(stocks, ShowStockDetails);
}

InitializeStockFilter(ShowStockDetails);
InitializeStockDetailsModal();
InitializeStockPriceModal();
window.OpenUpdateShopQuantityModal = OpenUpdateShopQuantityModal;
InitializeStockShopQuantityModal();

window.OpenUpdatePriceModal = OpenUpdatePriceModal;

await DisplayStocksPanel();
