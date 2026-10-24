import { ReturnCreateStockPanel } from "./ui/stock/CreateStockPanel.js";
import { DisplayBrandPanel } from "./features/brand/BrandFeature.js";
import { DisplayProductTypePanel } from "./features/productType/ProductTypeFeature.js";
import { DisplayProductSizePanel } from "./features/productSize/ProductSizeFeature.js";
import { DisplayProductPanel } from "./features/product/ProductFeature.js";
import { DisplayStockStart } from "./features/stock/StockFeature.js";
import { InitializeStockDocumentsFeature } from "../shared/stockDocuments/StockDocumentsFeature.js";

async function InitializeAddStockPage() {
  await ReturnCreateStockPanel();

  document.getElementById("back-to-menu-button").addEventListener("click", () => {
    window.location.href = "../LandingPage/LandingPage.html";
  });
  document
    .getElementById("back-to-menu-side-bar-button")
    .addEventListener("click", () => {
      window.location.href = "../LandingPage/LandingPage.html";
    });

  InitializeStockDocumentsFeature(document);

  document.getElementById("open-brand-panel").addEventListener("click", async () => {
    await DisplayBrandPanel();
  });
  document.getElementById("open-producttype-panel-button").addEventListener("click", async () => {
    await DisplayProductTypePanel();
  });
  document.getElementById("open-ProductSize-panel-button").addEventListener("click", async () => {
    await DisplayProductSizePanel();
  });
  document.getElementById("open-product-panel-button").addEventListener("click", async () => {
    await DisplayProductPanel();
  });
  document.getElementById("create-stock-sidebar-button").addEventListener("click", async () => {
    await DisplayStockStart();
  });

  await DisplayStockStart();
}

if (window.__pageAccessAllowed === true) await InitializeAddStockPage();
