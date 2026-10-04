import RequestAllStocks from "../../scripts/api/RequestAllStocks.js";
import RequestAllStocksListing from "../../scripts/api/RequestAllStocksListing.js";
import RequestStockById from "../../scripts/api/RequestStockById.js";
import SendUpdateStockShopQuantityRequest from "../../scripts/api/SendUpdateStockShopQuantityRequest.js";
import SendUpdateStockPriceRequest from "../../scripts/api/SendUpdateStockPriceRequest.js";

// Alert function

function AlertIcon(type) {
  switch (type) {
    case "success":
      return "bi bi-check-circle-fill";

    case "danger":
      return "bi bi-exclamation-circle-fill";

    case "warning":
      return "bi bi-exclamation-triangle-fill";

    case "info":
      return "bi bi-info-circle-fill";

    default:
      return "bi bi-info-circle-fill";
  }
}

async function DisplayAlert(type, message) {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");

  // Korábbi alert eltávolítása
  alertPlaceholder.innerHTML = "";

  // Alert létrehozása
  const wrapper = document.createElement("div");

  wrapper.innerHTML = `
    <div
      class="alert modern-alert alert-${type} fade show"
      role="alert"
    >
      <div class="modern-alert-icon">
        <i class="${AlertIcon(type)}"></i>
      </div>

      <div class="modern-alert-message">
        ${message}
      </div>

      <button
        type="button"
        class="modern-alert-close"
        aria-label="Bezárás"
      >
        <i class="bi bi-x-lg"></i>
      </button>

      <div class="modern-alert-progress"></div>
    </div>
  `;

  // Alert hozzáadása a DOM-hoz
  alertPlaceholder.appendChild(wrapper);

  // Most már biztosan létezik az elem
  const alertElement = wrapper.querySelector(".modern-alert");
  const closeButton = wrapper.querySelector(".modern-alert-close");

  // Bezárás függvény
  const closeAlert = () => {
    if (!alertElement || !alertElement.isConnected) {
      return;
    }

    alertElement.classList.remove("show");

    setTimeout(() => {
      if (alertElement.isConnected) {
        alertElement.remove();
      }
    }, 150);
  };

  // X gomb
  closeButton.addEventListener("click", closeAlert);

  // Automatikus bezárás 5 másodperc után
  setTimeout(() => {
    closeAlert();
  }, 3000);
}

function LoadingSpinner(isLoading) {
  const spinningOverlay = document.getElementById("spinning-overlay");
  if (isLoading) {
    spinningOverlay.classList.remove("d-none");
  } else {
    spinningOverlay.classList.add("d-none");
  }
}

document.getElementById("back-to-menu-button").addEventListener("click", () => {
  window.location.href = "../LandingPage/LandingPage.html";
});

function ReturnActiveOrInactiveBadge(isActive) {
  if (isActive) {
    return `<span class="badge bg-success fs-6 px-3 py-2"> Aktív </span>`;
  } else {
    return `<span class="badge bg-danger fs-6 px-3 py-2"> Inaktív </span>`;
  }
}

async function LoadStocks() {
  LoadingSpinner(true);
  const stocks = await RequestAllStocksListing();
  console.log(stocks);
  LoadingSpinner(false);

  return stocks;
}
function CalculatePrice(importPrice, vatPercent, marginPercent) {
  const priceWithVat = importPrice * (1 + vatPercent / 100);
  return Math.round(priceWithVat * (1 + marginPercent / 100));
}

function CalculateMargin(importPrice, currentPrice, vatPercent) {
  const priceWithVat = importPrice * (1 + vatPercent / 100);

  if (priceWithVat <= 0) return 0;

  return (currentPrice / priceWithVat - 1) * 100;
}

function HighlightMarginButton(currentMargin) {
  document
    .querySelectorAll("#update-price-modal .margin-btn")
    .forEach((btn) => {
      btn.classList.remove("btn-primary");
      btn.classList.add("btn-outline-primary");

      if (
        Math.round(parseFloat(btn.dataset.margin)) === Math.round(currentMargin)
      ) {
        btn.classList.remove("btn-outline-primary");
        btn.classList.add("btn-primary");
      }
    });
}

function RefreshPriceFromMargin() {
  if (!currentlySelectedStock) return;

  const marginInput = document.getElementById("update-margin");
  const newPriceInput = document.getElementById("update-new-price");
  const difference = document.getElementById("update-price-difference");
  const currentMarginLabel = document.getElementById("update-current-margin");

  const margin = parseFloat(marginInput.value) || 0;

  const newPrice = CalculatePrice(
    currentlySelectedStock.importPrice,
    currentlySelectedStock.afaPercent,
    margin,
  );

  newPriceInput.value = newPrice;

  currentMarginLabel.textContent = margin.toFixed(1) + "%";

  const diff = newPrice - currentlySelectedStock.currentPrice;

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

  HighlightMarginButton(margin);
}

function RefreshMarginFromPrice() {
  if (!currentlySelectedStock) return;

  const marginInput = document.getElementById("update-margin");
  const newPriceInput = document.getElementById("update-new-price");
  const difference = document.getElementById("update-price-difference");
  const currentMarginLabel = document.getElementById("update-current-margin");

  const newPrice = parseInt(newPriceInput.value) || 0;

  const margin = CalculateMargin(
    currentlySelectedStock.importPrice,
    newPrice,
    currentlySelectedStock.afaPercent,
  );

  marginInput.value = margin.toFixed(1);

  currentMarginLabel.textContent = margin.toFixed(1) + "%";

  const diff = newPrice - currentlySelectedStock.currentPrice;

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

  HighlightMarginButton(margin);
}

var currentlySelectedStock = null;

window.OpenUpdateShopQuantityModal = function () {
  if (currentlySelectedStock == null) {
    DisplayAlert("warning", "Hiba! Nincs megnyitott termék!");
    return;
  }

  const updateShopQuantityModal = new bootstrap.Modal(
    document.getElementById("change-shop-quantity-modal"),
  );

  document.getElementById("change-shop-quantity-product-name").textContent =
    currentlySelectedStock.product.productName;

  document.getElementById("change-shop-quantity-product-quantity").textContent =
    currentlySelectedStock.quantity;

  document.getElementById("change-shop-quantity-current").textContent =
    currentlySelectedStock.shopQuantity;

  document.getElementById("change-shop-quantity-new").value =
    currentlySelectedStock.shopQuantity;

  updateShopQuantityModal.show();
};

document
  .getElementById("save-update-stock-shop-quantity-btn")
  .addEventListener("click", async () => {
    const ShopQuantity = Number(
      document.getElementById("change-shop-quantity-new").value,
    );

    if (ShopQuantity > currentlySelectedStock.quantity) {
      DisplayAlert(
        "danger",
        "Nem lehet több a bolti mennyiség mint az összmennyiség!",
      );
      return;
    }

    const response = await SendUpdateStockShopQuantityRequest({
      Id: currentlySelectedStock.id,
      ShopQuantity,
    });

    if (response) {
      const updateShopQuantityModal = bootstrap.Modal.getInstance(
        document.getElementById("change-shop-quantity-modal"),
      );

      DisplayAlert("success", "Sikeres módosítás!");
      updateShopQuantityModal.hide();

      await ShowStockDetails(currentlySelectedStock.id);
    } else {
      DisplayAlert("danger", "Sikertelen módosítás!");
    }
  });

window.OpenUpdatePriceModal = function () {
  if (currentlySelectedStock == null) {
    DisplayAlert("warning", "Hiba! Nincs megnyitott termék!");
    return;
  }

  const updatePriceModal = new bootstrap.Modal(
    document.getElementById("update-price-modal"),
  );

  const showDetailsModal = bootstrap.Modal.getInstance(
    document.getElementById("stock-details-modal"),
  );

  document.getElementById("update-price-product-name").textContent =
    currentlySelectedStock.product.productName;

  document.getElementById("update-current-price").textContent =
    currentlySelectedStock.currentPrice.toLocaleString("hu-HU") + " Ft";

  document.getElementById("update-import-price").textContent =
    currentlySelectedStock.importPrice.toLocaleString("hu-HU") + " Ft";

  document.getElementById("update-vat").textContent =
    currentlySelectedStock.afaPercent + "%";

  const margin = CalculateMargin(
    currentlySelectedStock.importPrice,
    currentlySelectedStock.currentPrice,
    currentlySelectedStock.afaPercent,
  );

  document.getElementById("update-margin").value = margin.toFixed(1);

  document.getElementById("update-new-price").value =
    currentlySelectedStock.currentPrice;

  RefreshPriceFromMargin();

  if (showDetailsModal) {
    showDetailsModal.hide();
  }

  updatePriceModal.show();
};

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll("#update-price-modal .margin-btn")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("update-margin").value = btn.dataset.margin;

        RefreshPriceFromMargin();
      });
    });

  document
    .getElementById("update-margin")
    .addEventListener("input", RefreshPriceFromMargin);

  document
    .getElementById("update-new-price")
    .addEventListener("input", RefreshMarginFromPrice);

  document.getElementById("margin-plus").addEventListener("click", () => {
    const input = document.getElementById("update-margin");

    input.value = ((parseFloat(input.value) || 0) + 1).toFixed(1);

    RefreshPriceFromMargin();
  });

  document.getElementById("margin-minus").addEventListener("click", () => {
    const input = document.getElementById("update-margin");

    input.value = Math.max(0, (parseFloat(input.value) || 0) - 1).toFixed(1);

    RefreshPriceFromMargin();
  });

  document
    .getElementById("save-price-btn")
    .addEventListener("click", UpdatePriceRequest);
});

window.UpdatePriceRequest = async function () {
  if (currentlySelectedStock == null) {
    DisplayAlert("warning", "Nincs kiválasztott áru!");
    return;
  }

  const newPriceInput = document.getElementById("update-new-price");

  if (!newPriceInput.reportValidity()) {
    return;
  }

  const requestBody = {
    id: currentlySelectedStock.id,
    currentPrice: parseInt(newPriceInput.value),
  };

  const response = await SendUpdateStockPriceRequest(requestBody);

  if (response === true) {
    DisplayAlert("success", "Ár sikeresen módosítva.");

    currentlySelectedStock.currentPrice = parseInt(newPriceInput.value);

    bootstrap.Modal.getInstance(
      document.getElementById("update-price-modal"),
    ).hide();

    await ShowStockDetails(currentlySelectedStock);
  } else {
    DisplayAlert("danger", response);
  }
};

async function ShowStockDetails(stockId) {
  const modal = new bootstrap.Modal(
    document.getElementById("stock-details-modal"),
  );

  let stock = await RequestStockById(stockId);

  currentlySelectedStock = stock;

  const modalProductImage = document.getElementById("modal-product-image");
  const modalProductName = document.getElementById("modal-product-name");
  const modalProductBrandAndType = document.getElementById(
    "modal-product-brand-and-type",
  );
  const modalProductActive = document.getElementById("modal-product-active");
  const modalBarcode = document.getElementById("modal-barcode");
  const modalSku = document.getElementById("modal-sku");
  const modalQuantity = document.getElementById("modal-quantity");
  const modalShopQuantity = document.getElementById("modal-shop-quantity");
  const modalCurrentPrice = document.getElementById("modal-current-price");
  const modalImportPrice = document.getElementById("modal-import-price");
  const modalInvoice = document.getElementById("modal-invoice");
  const modalTransit = document.getElementById("modal-transit");
  const modalExpiration = document.getElementById("modal-expiration");
  const modalRecieved = document.getElementById("modal-recieved");

  if (stock.isDiscounted) {
    document
      .getElementById("modal-product-discount")
      .classList.remove("d-none");
  } else {
    document.getElementById("modal-product-discount").classList.add("d-none");
  }

  console.log(stock);

  if (stock.product.hasDeposit) {
    document.getElementById("modal-product-deposit").classList.remove("d-none");
  } else {
    document.getElementById("modal-product-deposit").classList.add("d-none");
  }

  console.log(stock);

  modalProductImage.src = stock.product.imageURL;
  modalProductName.textContent = stock.product.productName;
  modalProductBrandAndType.textContent = `${stock.product.brand} • ${stock.product.productType}`;
  modalProductActive.innerHTML = ReturnActiveOrInactiveBadge(
    stock.product.isActive,
  );
  modalBarcode.textContent = stock.product.barcode;
  modalSku.textContent = stock.product.sku;
  modalQuantity.textContent = `${stock.quantity} ${stock.product.productSize}`;
  modalShopQuantity.textContent = `${stock.shopQuantity} ${stock.product.productSize}`;
  modalCurrentPrice.textContent = `${stock.currentPrice} Ft`;

  if (sessionStorage.getItem("roleName") != "Counter") {
    modalImportPrice.textContent = `${stock.importPrice} Ft`;
  } else {
    modalImportPrice.textContent = `-`;
  }

  modalInvoice.textContent = stock.invoiceId;
  modalTransit.textContent = stock.transitId;
  modalExpiration.textContent = stock.expirationDate;
  modalRecieved.textContent = stock.recievedAt;

  modal.show();
}

document
  .getElementById("close-stock-details-modal-btn")
  .addEventListener("click", () => {
    currentlySelectedStock = null;
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("stock-details-modal"),
    );
    modal.hide();

    document
      .querySelectorAll("div.modal-backdrop")
      .forEach((div) => div.remove());
  });

if (sessionStorage.getItem("roleName") == "Admin")
  document.getElementById("edit-price-btn").classList.remove("d-none");

if (sessionStorage.getItem("roleName") == "Admin" || "Storage")
  document.getElementById("edit-shopquantity-btn").classList.remove("d-none");

const dismissSelectionButton = document.getElementById(
  "stock-clear-filter-button",
);

function GetDaysBetweenDates(date1, date2) {
  const [y1, m1, d1] = date1.split("-").map(Number);
  const [y2, m2, d2] = date2.split("-").map(Number);

  const firstDate = Date.UTC(y1, m1 - 1, d1);
  const secondDate = Date.UTC(y2, m2 - 1, d2);

  return Math.abs((secondDate - firstDate) / 86400000);
}

function GetTodayDate() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function FillStocks(stocks) {
  const stockTableBody = document.getElementById("stock-table-body");
  stockTableBody.innerHTML = "";

  stocks.forEach((stock) => {
    const row = document.createElement("tr");
    row.style.cursor = "pointer";

    const today = GetTodayDate();

    const differenceInDays = GetDaysBetweenDates(today, stock.expirationDate);
    console.log(differenceInDays);
    if (stock.isActive) {
      if (differenceInDays <= 30 && differenceInDays > 0) {
        row.classList.add("expiring-soon");
        console.log("expiring soon");
      } else if (differenceInDays <= 0) {
        row.classList.add("expired");
      }
    }

    row.innerHTML = `
      <td>
                    <div class="d-flex align-items-center">
                      <img
                        src="${stock.imageURL}"
                        class="rounded border me-3"
                        width="70"
                        height="70"
                      />

                      <div>
                        <div class="fw-bold">${stock.productName}</div>

                        <small class="text-muted">
                          ${stock.brand} • ${stock.productType}
                        </small>
                      </div>
                    </div>
                  </td>

                  <!-- Mennyiség -->
                  <td class="text-center">
                    <div class="text-muted small">Mennyiség</div>

                    <div class="fw-bold fs-5">${stock.quantity} / ${stock.originalQuantity} ${stock.productSize}</div>
                  </td>

                  <!-- Ár -->
                  <td class="text-center">
                    <div class="text-muted small">Ár / ${stock.productSize}</div>

                      <div class="fw-bold fs-5">${stock.price} Ft</div> 
                  </td>

                  <!-- Lejárat -->
                  <td class="text-center">
                    <div class="text-muted small">Lejárati dátum</div>

                    <div class="fw-bold fs-5">${stock.expirationDate}</div>
                  </td>

                  <!-- Állapot -->
                  <td class="text-center">
                    <div class="text-muted small">Állapot</div>

                    ${ReturnActiveOrInactiveBadge(stock.isActive)}
                  </td>
    `;

    row.addEventListener("click", () => ShowStockDetails(stock.stockId));
    stockTableBody.appendChild(row);
  });
}

async function DisplayStocksPanel() {
  const stocks = await LoadStocks();

  FillStocks(stocks);
}

await DisplayStocksPanel();

const stockSearchFilterInputLabel = document.getElementById(
  "stock-search-filter-input-label",
);

const selectionOptionSelector = document.getElementById(
  "stock-search-filter-select",
);

selectionOptionSelector.addEventListener("change", () => {
  switch (selectionOptionSelector.value) {
    case "nev":
      stockSearchFilterInputLabel.textContent = "Szűrés terméknév alapján:";
      break;
    case "vonalkod":
      stockSearchFilterInputLabel.textContent = "Szűrés vonalkód alapján:";
      break;
    case "sku":
      stockSearchFilterInputLabel.textContent =
        "Szűrés belső azonosító alapján:";
      break;
    case "termektipus":
      stockSearchFilterInputLabel.textContent = "Szűrés termék típus alapján:";
      break;
    case "termekmeret":
      stockSearchFilterInputLabel.textContent = "Szűrés termék méret alapján:";
      break;
    case "marka":
      stockSearchFilterInputLabel.textContent = "Szűrés márkák alapján:";
      break;
    default:
      break;
  }
});

document
  .getElementById("stock-filter-button")
  .addEventListener("click", async () => {
    const selectionOption = selectionOptionSelector.value;

    const selectionInputValue = document.getElementById(
      "stock-search-filter-input",
    ).value;

    switch (selectionOption) {
      case "nev":
        let stocks = await LoadStocks();
        let filteredStocks = stocks.filter((s) =>
          s.product.productName.includes(selectionInputValue),
        );
        FillStocks(filteredStocks);
        break;

      case "vonalkod":
        let stocksByBarcode = await LoadStocks();
        let filteredStocksByBarcode = stocksByBarcode.filter(
          (s) =>
            s.product.barcode != "" &&
            s.product.barcode != " " &&
            s.product.barcode != null &&
            s.product.barcode.includes(selectionInputValue),
        );
        FillStocks(filteredStocksByBarcode);
        break;

      case "sku":
        let stocksBySKU = await LoadStocks();
        let filteredStocksBySKU = stocksBySKU.filter((s) =>
          s.product.sku.includes(selectionInputValue),
        );
        FillStocks(filteredStocksBySKU);
        break;

      case "termektipus":
        let stocksByType = await LoadStocks();
        let filteredStocksByType = stocksByType.filter((s) =>
          s.product.productType.includes(selectionInputValue),
        );
        FillStocks(filteredStocksByType);
        break;

      case "termekmeret":
        let stocksBySize = await LoadStocks();
        let filteredStocksBySize = stocksBySize.filter((s) =>
          s.product.productSize.includes(selectionInputValue),
        );
        FillStocks(filteredStocksBySize);
        break;

      case "marka":
        let stocksByBrand = await LoadStocks();
        let filteredStocksByBrand = stocksByBrand.filter((s) =>
          s.product.brand.includes(selectionInputValue),
        );
        FillStocks(filteredStocksByBrand);
        break;
    }

    dismissSelectionButton.classList.remove("d-none");
  });

dismissSelectionButton.addEventListener("click", async () => {
  const stocks = await LoadStocks();
  FillStocks(stocks);
  dismissSelectionButton.classList.add("d-none");
});
