import {
  GetSelectedStock,
  UpdateStockPriceInList,
} from "../features/StockState.js";

import { UpdateStockPrice } from "../features/StockService.js";

import { LoadStocks } from "../features/StockFeature.js";
import { RenderStockList } from "./StockList.js";

import { ShowStockDetails } from "./StockDetailsModal.js";
import { DisplayAlert as DisplayStockAlert } from "../../shared/Alert.js";
import { IsExpiredStock } from "../../shared/ExpiredStockBadge.js";

function CalculatePrice(importPrice, vatPercent, marginPercent) {
  const priceWithVat = importPrice * (1 + vatPercent / 100);

  return Math.round(priceWithVat * (1 + marginPercent / 100));
}

function CalculateMargin(importPrice, currentPrice, vatPercent) {
  const priceWithVat = importPrice * (1 + vatPercent / 100);

  if (priceWithVat <= 0) {
    return 0;
  }

  return (currentPrice / priceWithVat - 1) * 100;
}

function HighlightMarginButton(currentMargin) {
  document
    .querySelectorAll("#update-price-modal .margin-btn")
    .forEach((button) => {
      button.classList.remove("btn-primary");
      button.classList.add("btn-outline-primary");

      if (
        Math.round(parseFloat(button.dataset.margin)) ===
        Math.round(currentMargin)
      ) {
        button.classList.remove("btn-outline-primary");
        button.classList.add("btn-primary");
      }
    });
}

function DisplayPriceDifference(newPrice, currentPrice) {
  const difference = document.getElementById("update-price-difference");
  const diff = newPrice - currentPrice;

  if (diff > 0) {
    difference.className = "text-center fw-bold text-success mt-3";

    difference.textContent = `+${diff.toLocaleString("hu-HU")} Ft`;
  } else if (diff < 0) {
    difference.className = "text-center fw-bold text-danger mt-3";

    difference.textContent = `${diff.toLocaleString("hu-HU")} Ft`;
  } else {
    difference.className = "text-center fw-bold text-secondary mt-3";

    difference.textContent = "Nincs változás";
  }
}

function RefreshPriceFromMargin() {
  const stock = GetSelectedStock();

  if (!stock) return;

  const marginInput = document.getElementById("update-margin");
  const newPriceInput = document.getElementById("update-new-price");
  const currentMarginLabel = document.getElementById("update-current-margin");

  const margin = parseFloat(marginInput.value) || 0;

  const newPrice = CalculatePrice(stock.importPrice, stock.afaPercent, margin);

  newPriceInput.value = newPrice;
  currentMarginLabel.textContent = `${margin.toFixed(1)}%`;

  DisplayPriceDifference(newPrice, stock.currentPrice);
  HighlightMarginButton(margin);
}

function RefreshMarginFromPrice() {
  const stock = GetSelectedStock();

  if (!stock) return;

  const marginInput = document.getElementById("update-margin");
  const newPriceInput = document.getElementById("update-new-price");
  const currentMarginLabel = document.getElementById("update-current-margin");

  const newPrice = parseInt(newPriceInput.value) || 0;

  const margin = CalculateMargin(stock.importPrice, newPrice, stock.afaPercent);

  marginInput.value = margin.toFixed(1);
  currentMarginLabel.textContent = `${margin.toFixed(1)}%`;

  DisplayPriceDifference(newPrice, stock.currentPrice);
  HighlightMarginButton(margin);
}

export function OpenUpdatePriceModal() {
  const stock = GetSelectedStock();

  if (!stock) {
    DisplayStockAlert("warning", "Hiba! Nincs megnyitott termék!");
    return;
  }

  const modalElement = document.getElementById("update-price-modal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  const detailsModal = bootstrap.Modal.getInstance(
    document.getElementById("stock-details-modal"),
  );

  document.getElementById("update-price-product-name").textContent =
    stock.product.productName;
  document.getElementById("update-price-expired-badge")?.classList.toggle("d-none", !IsExpiredStock(stock));

  document.getElementById("update-current-price").textContent =
    `${stock.currentPrice.toLocaleString("hu-HU")} Ft`;

  document.getElementById("update-import-price").textContent =
    `${stock.importPrice.toLocaleString("hu-HU")} Ft`;

  document.getElementById("update-vat").textContent = `${stock.afaPercent}%`;

  const margin = CalculateMargin(
    stock.importPrice,
    stock.currentPrice,
    stock.afaPercent,
  );

  document.getElementById("update-margin").value = margin.toFixed(1);
  document.getElementById("update-new-price").value = stock.currentPrice;

  RefreshPriceFromMargin();

  detailsModal?.hide();
  modal.show();
}

async function UpdatePriceRequest() {
  const stock = GetSelectedStock();

  if (!stock) {
    DisplayStockAlert("warning", "Nincs kiválasztott áru!");
    return;
  }

  const newPriceInput = document.getElementById("update-new-price");

  if (!newPriceInput.reportValidity()) {
    return;
  }

  const newPrice = parseInt(newPriceInput.value);

  const response = await UpdateStockPrice({
    id: stock.id,
    currentPrice: newPrice,
  });

  if (!response.success) {
    DisplayStockAlert("danger", response.message);
    return;
  }

  DisplayStockAlert("success", "Ár sikeresen módosítva.");

  stock.currentPrice = newPrice;
  UpdateStockPriceInList(stock.id, newPrice);

  bootstrap.Modal.getInstance(
    document.getElementById("update-price-modal"),
  )?.hide();

  const stocks = await LoadStocks();

  if (stocks !== null) {
    RenderStockList(stocks, async (stockId) => {
      await ShowStockDetails(stockId);
    });
  }
}

export function InitializeStockPriceModal() {
  document
    .getElementById("edit-price-btn")
    ?.addEventListener("click", OpenUpdatePriceModal);

  document
    .querySelectorAll("#update-price-modal .margin-btn")
    .forEach((button) => {
      button.addEventListener("click", () => {
        document.getElementById("update-margin").value = button.dataset.margin;

        RefreshPriceFromMargin();
      });
    });

  document
    .getElementById("update-margin")
    ?.addEventListener("input", RefreshPriceFromMargin);

  document
    .getElementById("update-new-price")
    ?.addEventListener("input", RefreshMarginFromPrice);

  document.getElementById("margin-plus")?.addEventListener("click", () => {
    const input = document.getElementById("update-margin");

    input.value = ((parseFloat(input.value) || 0) + 1).toFixed(1);

    RefreshPriceFromMargin();
  });

  document.getElementById("margin-minus")?.addEventListener("click", () => {
    const input = document.getElementById("update-margin");

    input.value = Math.max(0, (parseFloat(input.value) || 0) - 1).toFixed(1);

    RefreshPriceFromMargin();
  });

  document
    .getElementById("save-price-btn")
    ?.addEventListener("click", UpdatePriceRequest);
}
