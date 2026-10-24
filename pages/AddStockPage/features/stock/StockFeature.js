import { SetProductImageSource } from "../../../shared/ProductImage.js";
import { RenderStockStart } from "../../ui/stock/StockStart.js";
import { RenderStockBarcode } from "../../ui/stock/StockBarcode.js";
import { RenderStockProductList } from "../../ui/stock/StockProductList.js";
import { RenderStockProductCard } from "../../ui/stock/StockProductCard.js";
import { RenderStockPanel } from "../../ui/stock/StockPanel.js";

import {
  CalculateSellingPrice,
  CalculateMarginFromSellingPrice,
  SetMargin,
  SetVAT,
  GetMargin,
  GetVAT,
} from "./StockPriceCalculator.js";

import {
  GetProducts,
  GetProductByBarcode,
  GetProductBySKU,
  AddStock,
  GetStockListing,
} from "./StockService.js";

import {
  SetSelectedProduct,
  SetChosenProductForAddStock,
  SetIsAddStockByBarcodeOpen,
  GetChosenProductForAddStock,
  GetCurrentVAT,
  SetCurrentVAT,
  GetCurrentMargin,
  SetCurrentMargin,
} from "./StockState.js";

import { DisplayAlert } from "../../../shared/Alert.js";
import { NormalizeBarcode } from "../../../shared/NormalizeBarcode.js";
import { RenderStockDocumentsSection } from "../../../shared/stockDocuments/StockDocumentsUI.js";
import { LoadStockDocumentsSection } from "../../../shared/stockDocuments/StockDocumentsFeature.js";
import { RenderExpiredStockBadge } from "../../../shared/ExpiredStockBadge.js";

const panelLabel = document.getElementById("panel-label");

const contentContainer = document.getElementById("content-container");

/*
 * ============================================================
 * STOCK START
 * ============================================================
 */

export function DisplayStockStart() {
  panelLabel.textContent = "Áru hozzáadása";

  contentContainer.innerHTML = RenderStockStart();

  RegisterStockStartEvents();
}

function RegisterStockStartEvents() {
  const barcodeButton = document.querySelector('[data-action="barcode"]');

  const productButton = document.querySelector('[data-action="product"]');

  if (barcodeButton) {
    barcodeButton.addEventListener("click", DisplayStockByBarcode);
  }

  if (productButton) {
    productButton.addEventListener("click", DisplayStockProducts);
  }
}

/*
 * ============================================================
 * BARCODE
 * ============================================================
 */

function DisplayStockByBarcode() {
  panelLabel.textContent = "Áru hozzáadása - Vonalkód alapján";

  contentContainer.innerHTML = RenderStockBarcode();

  SetIsAddStockByBarcodeOpen(true);
  scannerBarcode = "";

  RegisterStockBarcodeEvents();
  RegisterBarcodeScanner();

  const input = document.getElementById("addstock-barcode-input");

  input?.focus();
}

function RegisterStockBarcodeEvents() {
  const backButton = document.getElementById("stock-barcode-back-button");

  const nextButton = document.getElementById("stock-barcode-next-button");

  if (backButton) {
    backButton.addEventListener("click", DisplayStockStart);
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      CheckProductByBarcode();
    });
  }
}

/*
 * ============================================================
 * BARCODE SCANNER
 * ============================================================
 */

let scannerBarcode = "";
let isBarcodeScannerRegistered = false;

function RegisterBarcodeScanner() {
  if (isBarcodeScannerRegistered) {
    return;
  }

  document.addEventListener("keydown", HandleBarcodeScannerInput);
  isBarcodeScannerRegistered = true;
}

function HandleBarcodeScannerInput(event) {
  if (!document.getElementById("addstock-barcode-input")) {
    return;
  }

  if (event.key === "Enter") {
    const barcode = NormalizeBarcode(scannerBarcode);

    scannerBarcode = "";

    if (barcode) {
      CheckProductByBarcode(barcode);
    }

    return;
  }

  if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
    return;
  }

  if (event.key.length !== 1) {
    return;
  }

  scannerBarcode += event.key;
}

/*
 * ============================================================
 * BARCODE PRODUCT SEARCH
 * ============================================================
 */

async function CheckProductByBarcode(barcode = null) {
  const barcodeInput = document.getElementById("addstock-barcode-input");

  const barcodeValue = NormalizeBarcode(barcode ?? barcodeInput?.value);

  if (!barcodeValue) {
    DisplayAlert("danger", "Kérlek, adj meg egy vonalkódot!");

    return;
  }

  const response = await GetProductByBarcode(barcodeValue);

  if (!response.success) {
    DisplayAlert("danger", response.error);

    return;
  }

  SetChosenProductForAddStock(response.data);

  SetSelectedProduct(response.data);

  SetIsAddStockByBarcodeOpen(false);

  await DisplayStockFinalPage();
}

/*
 * ============================================================
 * PRODUCT LIST
 * ============================================================
 */

async function DisplayStockProducts() {
  panelLabel.textContent = "Áru hozzáadása - Termék kiválasztása";

  contentContainer.innerHTML = RenderStockProductList();

  const container = document.getElementById("addstock-products-container");

  if (!container) {
    return;
  }

  const response = await GetProducts();

  if (!response.success) {
    DisplayAlert("danger", response.error);

    return;
  }

  const products = response.data;

  container.innerHTML = products
    .map((product) => RenderStockProductCard(product))
    .join("");

  RegisterProductSelection(products);
  RegisterProductListEvents();
}

/*
 * ============================================================
 * PRODUCT SELECTION
 * ============================================================
 */

function RegisterProductSelection(products) {
  const productCards = document.querySelectorAll(".product-card");

  productCards.forEach((card) => {
    card.addEventListener("click", () => {
      const productSKU = card.dataset.productSku;

      const product = products.find((item) => item.sku === productSKU);

      if (!product) {
        return;
      }

      SelectProduct(product, card);
    });
  });
}

function SelectProduct(product, card) {
  document.querySelectorAll(".product-card").forEach((productCard) => {
    productCard.classList.remove("selected");
  });

  card.classList.add("selected");

  SetSelectedProduct(product);
  SetChosenProductForAddStock(product);

  const image = document.getElementById("selected-product-image");

  const name = document.getElementById("selected-product-name");

  if (image) {
    SetProductImageSource(image, product.productImageURL || product.imageURL, { loading: "eager" });
  }

  if (name) {
    name.textContent = product.productName ?? "";
  }
}

/*
 * ============================================================
 * PRODUCT LIST EVENTS
 * ============================================================
 */

function RegisterProductListEvents() {
  const backButton = document.getElementById("stock-product-back-button");

  const nextButton = document.getElementById("stock-product-next-button");

  if (backButton) {
    backButton.addEventListener("click", DisplayStockStart);
  }

  if (nextButton) {
    nextButton.addEventListener("click", CheckChosenProduct);
  }
}

function CheckChosenProduct() {
  const product = GetChosenProductForAddStock();

  if (!product) {
    DisplayAlert("danger", "Kérlek, válassz ki egy terméket!");

    return;
  }

  DisplayStockFinalPage();
}

/*
 * ============================================================
 * FINAL STOCK PAGE
 * ============================================================
 */

async function DisplayStockFinalPage() {
  panelLabel.textContent = "Áru hozzáadása - Készlet adatai";

  const product = GetChosenProductForAddStock();

  if (!product) {
    DisplayAlert("danger", "Nincs kiválasztott termék!");

    DisplayStockStart();
    return;
  }

  contentContainer.innerHTML = RenderStockPanel();

  await LoadStockProductDetails(product);

  RegisterStockFinalPageEvents();
}

async function LoadStockProductDetails(product) {
  const response = await GetProductBySKU(product.sku);

  if (!response.success) {
    DisplayAlert("danger", response.error);

    return;
  }

  const selectedProduct = response.data;

  const image = document.getElementById("addstock-selected-product-image");

  const name = document.getElementById("addstock-selected-product-name");

  const barcode = document.getElementById("addstock-selected-product-barcode");

  const sku = document.getElementById("addstock-selected-product-sku");

  const brand = document.getElementById("addstock-selected-product-brand");

  const type = document.getElementById("addstock-selected-product-type");

  const size = document.getElementById("addstock-selected-product-size");

  if (image) {
    SetProductImageSource(
      image,
      selectedProduct.productImageURL ||
        selectedProduct.imageURL ||
        product.productImageURL ||
        product.imageURL,
      { loading: "eager" },
    );
  }

  if (name) {
    name.textContent = selectedProduct.productName ?? "-";
  }

  if (barcode) {
    barcode.textContent = selectedProduct.barcode ?? "-";
  }

  if (sku) {
    sku.textContent = selectedProduct.sku ?? "-";
  }

  if (brand) {
    brand.textContent = selectedProduct.brand ?? "-";
  }

  if (type) {
    type.textContent = selectedProduct.productType ?? "-";
  }

  if (size) {
    size.textContent = selectedProduct.productSize ?? "-";
  }
}

function RegisterStockFinalPageEvents() {
  const backButton = document.getElementById("stock-panel-back-button");

  const detailsBackButton = document.getElementById(
    "stock-details-back-button",
  );

  const saveButton = document.getElementById("stock-panel-save-button");

  if (backButton) {
    backButton.addEventListener("click", DisplayStockStart);
  }

  if (detailsBackButton) {
    detailsBackButton.addEventListener("click", DisplayStockStart);
  }

  if (saveButton) {
    saveButton.addEventListener("click", HandleAddStock);
  }

  RegisterPriceCalculatorEvents();
}

function RegisterPriceCalculatorEvents() {
  const importPriceInput = document.getElementById("addstock-import-price");

  const currentPriceInput = document.getElementById("addstock-current-price");

  const marginInput = document.getElementById("addstock-margin-input");

  const vatInput = document.getElementById("addstock-vat");

  if (importPriceInput) {
    importPriceInput.addEventListener("input", () => {
      const importPrice = Number(importPriceInput.value);

      const sellingPrice = CalculateSellingPrice(importPrice);

      if (currentPriceInput) {
        currentPriceInput.value = sellingPrice ?? "";
      }
    });
  }

  if (currentPriceInput) {
    currentPriceInput.addEventListener("input", () => {
      const importPrice = Number(importPriceInput?.value);

      const currentPrice = Number(currentPriceInput.value);

      const margin = CalculateMarginFromSellingPrice(importPrice, currentPrice);

      if (margin === null) {
        return;
      }

      SetMargin(margin);

      if (marginInput) {
        marginInput.value = margin.toFixed(2);
      }

      UpdateMarginButtons();
    });
  }

  if (marginInput) {
    marginInput.addEventListener("input", () => {
      const margin = Number(marginInput.value);

      if (Number.isNaN(margin)) {
        return;
      }

      SetMargin(margin);

      const importPrice = Number(importPriceInput?.value);

      const sellingPrice = CalculateSellingPrice(importPrice);

      if (currentPriceInput) {
        currentPriceInput.value = sellingPrice ?? "";
      }

      UpdateMarginButtons();
    });
  }

  document.querySelectorAll("[data-margin]").forEach((button) => {
    button.addEventListener("click", () => {
      const margin = Number(button.dataset.margin);

      SetMargin(margin);

      if (marginInput) {
        marginInput.value = margin;
      }

      const importPrice = Number(importPriceInput?.value);

      const sellingPrice = CalculateSellingPrice(importPrice);

      if (currentPriceInput) {
        currentPriceInput.value = sellingPrice ?? "";
      }

      UpdateMarginButtons();
    });
  });

  document.querySelectorAll("[data-vat]").forEach((button) => {
    button.addEventListener("click", () => {
      const vat = Number(button.dataset.vat);

      SetVAT(vat);

      if (vatInput) {
        vatInput.value = vat;
      }

      const importPrice = Number(importPriceInput?.value);

      const sellingPrice = CalculateSellingPrice(importPrice);

      if (currentPriceInput) {
        currentPriceInput.value = sellingPrice ?? "";
      }

      UpdateVATButtons();
    });
  });

  if (marginInput) {
    marginInput.value = GetMargin();
  }

  if (vatInput) {
    vatInput.value = GetVAT();
  }

  UpdateMarginButtons();
  UpdateVATButtons();

  const importPrice = Number(importPriceInput?.value);

  const sellingPrice = CalculateSellingPrice(importPrice);

  if (currentPriceInput) {
    currentPriceInput.value = sellingPrice ?? "";
  }
}

function UpdateMarginButtons() {
  const currentMargin = GetMargin();

  document.querySelectorAll("[data-margin]").forEach((button) => {
    const buttonMargin = Number(button.dataset.margin);

    button.classList.remove("btn-primary", "btn-outline-secondary");

    if (buttonMargin === currentMargin) {
      button.classList.add("btn-primary");
    } else {
      button.classList.add("btn-outline-secondary");
    }
  });
}

function UpdateVATButtons() {
  const currentVAT = GetVAT();

  document.querySelectorAll("[data-vat]").forEach((button) => {
    const buttonVAT = Number(button.dataset.vat);

    button.classList.remove("btn-primary", "btn-outline-secondary");

    if (buttonVAT === currentVAT) {
      button.classList.add("btn-primary");
    } else {
      button.classList.add("btn-outline-secondary");
    }
  });
}

async function HandleAddStock() {
  const product = GetChosenProductForAddStock();

  if (!product) {
    DisplayAlert("danger", "Termék nem található!");

    return;
  }

  const quantityInput = document.getElementById("addstock-quantity");

  const importPriceInput = document.getElementById("addstock-import-price");

  const currentPriceInput = document.getElementById("addstock-current-price");

  const vatInput = document.getElementById("addstock-vat");

  const invoiceInput = document.getElementById("addstock-invoice-id");

  const transitInput = document.getElementById("addstock-transit-id");

  const expirationInput = document.getElementById("addstock-expiration-date");

  const receivedInput = document.getElementById("addstock-received-at");

  if (
    !quantityInput?.reportValidity() ||
    !importPriceInput?.reportValidity() ||
    !currentPriceInput?.reportValidity() ||
    !invoiceInput?.reportValidity() ||
    !transitInput?.reportValidity() ||
    !expirationInput?.reportValidity() ||
    !receivedInput?.reportValidity()
  ) {
    return;
  }

  const requestBody = {
    productSKU: product.sku,
    quantity: Number(quantityInput.value),
    importPrice: Number(importPriceInput.value),
    currentPrice: Number(currentPriceInput.value),
    afaPercent: Number(vatInput.value),
    invoiceId: invoiceInput.value.trim(),
    transitId: transitInput.value.trim(),
    expirationDate: expirationInput.value,
    recievedAt: receivedInput.value.split("T")[0],
  };

  const response = await AddStock(requestBody);

  if (!response.success) {
    DisplayAlert("danger", response.error);

    return;
  }

  DisplayAlert("success", "Sikeres áru hozzáadása!");

  if (sessionStorage.getItem("roleName") === "Admin") {
    await ShowStockDocumentsAfterReceipt(response.data, requestBody);
    return;
  }

  ResetStockForm();
  DisplayStockStart();
}

function extractCreatedStockId(value, depth = 0) {
  if (depth > 3 || value == null) return null;
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return value;
  if (typeof value !== "object") return null;

  const direct = value.stockId ?? value.stockID ?? value.stock?.stockId ?? value.stock?.id;
  if (direct != null && String(direct).trim() !== "") return direct;
  if (value.id != null && (value.productSKU || value.productSku || value.product)) return value.id;
  return extractCreatedStockId(value.data ?? value.result ?? value.stock, depth + 1);
}

function normalizeComparable(value) {
  return String(value ?? "").trim().toLocaleLowerCase("hu-HU");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function getStockSku(stock) {
  return stock.productSKU ?? stock.productSku ?? stock.sku ?? stock.product?.sku;
}

function findCreatedStockCandidates(stocks, requestBody) {
  return stocks.filter((stock) => {
    const invoice = stock.invoiceId ?? stock.invoiceNumber;
    const transit = stock.transitId ?? stock.deliveryNoteId ?? stock.shippingDocumentId;
    const received = stock.recievedAt ?? stock.receivedAt ?? stock.receivedAtUtc;
    const expiration = stock.expirationDate ?? stock.expiryDate;
    return (
      normalizeComparable(getStockSku(stock)) === normalizeComparable(requestBody.productSKU) &&
      normalizeComparable(invoice) === normalizeComparable(requestBody.invoiceId) &&
      normalizeComparable(transit) === normalizeComparable(requestBody.transitId) &&
      String(received ?? "").slice(0, 10) === requestBody.recievedAt &&
      String(expiration ?? "").slice(0, 10) === requestBody.expirationDate
    );
  }).filter((stock) => stock.stockId ?? stock.stockID ?? stock.id);
}

function renderStockDocumentFollowUp(stockId) {
  panelLabel.textContent = "Áru hozzáadása - Bizonylatok";
  contentContainer.innerHTML = `
    <div class="container-fluid py-3">
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex align-items-start gap-3">
            <span class="stock-document-icon flex-shrink-0"><i class="bi bi-check2-circle" aria-hidden="true"></i></span>
            <div>
              <h2 class="h4 fw-bold mb-1">Az árutétel rögzítve</h2>
              <p class="text-body-secondary mb-0">Most feltöltheted a számlát és a szállítólevelet. A fájlnevek alapján tudod majd megkülönböztetni a dokumentumokat.</p>
            </div>
          </div>
        </div>
      </div>
      <div class="row g-3">${RenderStockDocumentsSection(stockId)}</div>
      <div class="d-flex justify-content-end gap-2 py-3">
        <button type="button" class="btn btn-primary btn-lg px-4" data-stock-documents-finish>
          <i class="bi bi-check-lg me-2" aria-hidden="true"></i>Kész, új áru felvétele
        </button>
      </div>
    </div>
  `;

  const section = contentContainer.querySelector("[data-stock-document-section]");
  void LoadStockDocumentsSection(section);
  contentContainer.querySelector("[data-stock-documents-finish]")?.addEventListener("click", () => {
    ResetStockForm();
    DisplayStockStart();
  });
}

function renderStockCandidatePicker(candidates) {
  panelLabel.textContent = "Áru hozzáadása - Bizonylatok";
  contentContainer.innerHTML = `
    <div class="container-fluid py-3">
      <div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Az áru rögzítése sikerült. Válaszd ki a most létrehozott készlettételt a dokumentumok csatolásához.</div>
      <div class="row g-3">${candidates.map((stock) => {
        const id = stock.stockId ?? stock.stockID ?? stock.id;
        return `<div class="col-12 col-lg-6"><button class="btn btn-outline-primary text-start w-100 p-3" type="button" data-select-stock-documents="${escapeHtml(id)}">
          <span class="fw-bold d-block">${escapeHtml(stock.productName ?? stock.product?.productName ?? getStockSku(stock))} ${RenderExpiredStockBadge(stock, "ms-1")}</span>
          <span class="small d-block">Áruazonosító: ${escapeHtml(id)} · Mennyiség: ${escapeHtml(stock.quantity)}</span>
          <span class="small d-block">Számla: ${escapeHtml(stock.invoiceId)} · Szállítólevél: ${escapeHtml(stock.transitId)}</span>
        </button></div>`;
      }).join("")}</div>
      <button type="button" class="btn btn-outline-secondary btn-lg mt-3" data-stock-documents-finish>Vissza az árufelvételhez</button>
    </div>
  `;
  contentContainer.querySelectorAll("[data-select-stock-documents]").forEach((button) => {
    button.addEventListener("click", () => renderStockDocumentFollowUp(button.dataset.selectStockDocuments));
  });
  contentContainer.querySelector("[data-stock-documents-finish]")?.addEventListener("click", () => {
    ResetStockForm();
    DisplayStockStart();
  });
}

async function ShowStockDocumentsAfterReceipt(responseData, requestBody) {
  const createdId = extractCreatedStockId(responseData);
  if (createdId != null) {
    renderStockDocumentFollowUp(createdId);
    return;
  }

  let listing;
  try {
    listing = await GetStockListing();
  } catch (error) {
    listing = { success: false, error: error.message || "A készletlista lekérése sikertelen." };
  }
  const candidates = listing.success
    ? findCreatedStockCandidates(listing.data, requestBody)
    : [];

  if (candidates.length === 1) {
    renderStockDocumentFollowUp(candidates[0].stockId ?? candidates[0].stockID ?? candidates[0].id);
    return;
  }
  if (candidates.length > 1) {
    renderStockCandidatePicker(candidates);
    return;
  }

  panelLabel.textContent = "Áru hozzáadása - Bizonylatok";
  contentContainer.innerHTML = `
    <div class="container-fluid py-3">
      <div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Az áru rögzítése sikerült.</div>
      <div class="alert alert-warning">
        <h2 class="h5">A dokumentumok most nem kapcsolhatók hozzá</h2>
        <p class="mb-0">A backend nem adott vissza készlettétel-azonosítót, és a friss készletlistában sem sikerült egyértelműen megtalálni az új tételt. Nyisd meg az Árupanelt, keresd meg a tételt, majd az adatainál töltsd fel a PDF-eket.${listing.success ? "" : ` Betöltési hiba: ${escapeHtml(listing.error)}`}</p>
      </div>
      <button type="button" class="btn btn-outline-secondary btn-lg" data-stock-documents-finish>Vissza az árufelvételhez</button>
      <a class="btn btn-primary btn-lg ms-2" href="../StockPanel/StockPanel.html">Árupanel megnyitása</a>
    </div>
  `;
  contentContainer.querySelector("[data-stock-documents-finish]")?.addEventListener("click", () => {
    ResetStockForm();
    DisplayStockStart();
  });
}

function ResetStockForm() {
  const quantityInput = document.getElementById("addstock-quantity");

  const importPriceInput = document.getElementById("addstock-import-price");

  const currentPriceInput = document.getElementById("addstock-current-price");

  const marginInput = document.getElementById("addstock-margin-input");

  const invoiceInput = document.getElementById("addstock-invoice-id");

  const transitInput = document.getElementById("addstock-transit-id");

  const expirationInput = document.getElementById("addstock-expiration-date");

  const receivedInput = document.getElementById("addstock-received-at");

  if (quantityInput) {
    quantityInput.value = "";
  }

  if (importPriceInput) {
    importPriceInput.value = "";
  }

  if (currentPriceInput) {
    currentPriceInput.value = "";
  }

  if (marginInput) {
    marginInput.value = "";
  }

  if (invoiceInput) {
    invoiceInput.value = "";
  }

  if (transitInput) {
    transitInput.value = "";
  }

  if (expirationInput) {
    expirationInput.value = "";
  }

  if (receivedInput) {
    receivedInput.value = "";
  }

  SetCurrentVAT(27);
  SetCurrentMargin(30);
}
