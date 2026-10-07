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

function RegisterBarcodeScanner() {
  document.addEventListener("keydown", HandleBarcodeScannerInput);
}

function HandleBarcodeScannerInput(event) {
  if (!document.getElementById("addstock-barcode-input")) {
    return;
  }

  if (event.key === "Enter") {
    const barcode = scannerBarcode.replace("ö", "0").replace("Ö", "0");

    scannerBarcode = "";

    if (barcode) {
      CheckProductByBarcode(barcode);
    }

    return;
  }

  if (
    event.key === "Control" ||
    event.key === "Shift" ||
    event.key === "Alt" ||
    event.key === "Meta"
  ) {
    return;
  }

  if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) {
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

  const barcodeValue = barcode ?? barcodeInput?.value.trim();

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

  container.innerHTML = "";

  products.forEach((product) => {
    container.innerHTML += RenderStockProductCard(product);
  });

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
    image.src = product.productImageURL ?? "";
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
    image.src =
      selectedProduct.productImageURL ??
      selectedProduct.imageURL ??
      product.productImageURL ??
      product.imageURL ??
      "";
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

  ResetStockForm();
  DisplayStockStart();
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
