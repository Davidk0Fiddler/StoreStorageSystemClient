import { LoadStocks, FilterStocks } from "../features/StockFeature.js";
import { RenderStockList } from "./StockList.js";

export function InitializeStockFilter(onStockClick) {
  const selectionOptionSelector = document.getElementById(
    "stock-search-filter-select",
  );

  const selectionInput = document.getElementById("stock-search-filter-input");

  const selectionInputLabel = document.getElementById(
    "stock-search-filter-input-label",
  );

  const filterButton = document.getElementById("stock-filter-button");

  const clearFilterButton = document.getElementById(
    "stock-clear-filter-button",
  );

  if (
    !selectionOptionSelector ||
    !selectionInput ||
    !selectionInputLabel ||
    !filterButton ||
    !clearFilterButton
  ) {
    console.error("A készletszűrő egyik HTML-eleme nem található.");
    return;
  }

  selectionOptionSelector.addEventListener("change", () => {
    switch (selectionOptionSelector.value) {
      case "nev":
        selectionInputLabel.textContent = "Szűrés terméknév alapján:";
        break;

      case "vonalkod":
        selectionInputLabel.textContent = "Szűrés vonalkód alapján:";
        break;

      case "sku":
        selectionInputLabel.textContent = "Szűrés belső azonosító alapján:";
        break;

      case "termektipus":
        selectionInputLabel.textContent = "Szűrés termék típus alapján:";
        break;

      case "termekmeret":
        selectionInputLabel.textContent = "Szűrés termék méret alapján:";
        break;

      case "marka":
        selectionInputLabel.textContent = "Szűrés márkák alapján:";
        break;
    }
  });

  filterButton.addEventListener("click", async () => {
    const stocks = await LoadStocks();

    if (stocks === null) {
      return;
    }

    const filteredStocks = FilterStocks(
      selectionOptionSelector.value,
      selectionInput.value,
    );

    RenderStockList(filteredStocks, onStockClick);
    clearFilterButton.classList.remove("d-none");
  });

  clearFilterButton.addEventListener("click", async () => {
    const stocks = await LoadStocks();

    if (stocks === null) {
      return;
    }

    RenderStockList(stocks, onStockClick);
    clearFilterButton.classList.add("d-none");
    selectionInput.value = "";
  });
}
