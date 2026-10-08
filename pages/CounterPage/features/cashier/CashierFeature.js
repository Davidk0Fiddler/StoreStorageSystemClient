import {
  GetIsCashRegisterMode,
  SetIsCashRegisterMode,
} from "./CashierState.js";

import { GetAllProductsForCashier } from "./CashierService.js";

import { AddToCart, InitializeCart } from "../cart/CartFeature.js";

import { OpenProductSearchModal } from "../productSearch/ProductSearchFeature.js";

import { InitializeCheckout } from "../checkout/CheckoutFeature.js";

import {
  GetCashRegisterModal,
  GetCashierProductList,
  GetCashierProductSearch,
  GetQuantityModal,
  GetQuantityProductName,
  GetQuantityInput,
  GetQuantityUnit,
  GetQuantityCheckButton,
  ShowCashRegisterModal,
  ShowQuantityModal,
  HideQuantityModal,
} from "../../ui/cashier/CashierPanel.js";

import { DisplayAlert } from "../../../shared/Alert.js";

let cashierProducts = [];
let quantityModal = null;

let isInitialized = false;
let isBarcodeListenerInitialized = false;

function GetQuantityStep(product) {
  if (product?.productSize === "db") {
    return 1;
  }

  return 0.05;
}

function RenderCashierProducts(products) {
  const productList = GetCashierProductList();

  if (!productList) {
    return;
  }

  productList.innerHTML = "";

  products.forEach((product) => {
    const cardWrapper = document.createElement("div");

    cardWrapper.classList.add("col");

    const card = document.createElement("div");

    card.classList.add("card", "h-100", "border-0", "rounded");

    card.style.cursor = "pointer";

    card.innerHTML = `
      <img
        src="${product.imageURL ?? ""}"
        alt="${product.productName ?? "Termék"}"
        class="card-img-top object-fit-contain p-2"
        style="height: 140px;"
      >

      <div
        class="card-body d-flex align-items-center justify-content-center p-2"
      >
        <div class="fw-semibold text-center">
          ${product.productName ?? "Ismeretlen termék"}
        </div>
      </div>
    `;

    cardWrapper.appendChild(card);
    productList.appendChild(cardWrapper);

    card.addEventListener("click", async () => {
      await SelectCashierProduct(product);
    });
  });

  productList.scrollTo({
    top: productList.scrollHeight,
    behavior: "smooth",
  });
}

async function AddCashierProduct(product, quantity) {
  await AddToCart(product, quantity);
}

async function OpenQuantitySelector(product) {
  const productName = GetQuantityProductName();

  const quantityInput = GetQuantityInput();

  const unit = GetQuantityUnit();

  const checkButton = GetQuantityCheckButton();

  if (!productName || !quantityInput || !unit || !checkButton) {
    return;
  }

  productName.textContent = product.productName ?? "Ismeretlen termék";

  unit.textContent = product.productSize ?? "";

  quantityInput.value = product.saleQuantityStep ?? GetQuantityStep(product);

  quantityInput.step = product.saleQuantityStep ?? GetQuantityStep(product);

  const newCheckButton = checkButton.cloneNode(true);

  checkButton.replaceWith(newCheckButton);

  newCheckButton.addEventListener("click", async () => {
    const quantity = Math.round(Number(quantityInput.value) * 100) / 100;

    if (quantity <= 0) {
      DisplayAlert("danger", "A mennyiségnek nagyobbnak kell lennie 0-nál.");

      return;
    }

    HideQuantityModal(quantityModal);

    await AddCashierProduct(product, quantity);
  });

  quantityModal = ShowQuantityModal();

  const quantityModalElement = GetQuantityModal();

  quantityModalElement?.addEventListener(
    "shown.bs.modal",
    () => {
      quantityInput.focus();
      quantityInput.select();
    },
    {
      once: true,
    },
  );
}

async function SelectCashierProduct(product) {
  if (!product) {
    return;
  }

  if (product.productSize === "db") {
    await AddCashierProduct(product, 1);

    return;
  }

  await OpenQuantitySelector(product);
}

function InitializeProductSearch() {
  const searchInput = GetCashierProductSearch();

  if (!searchInput) {
    return;
  }

  searchInput.addEventListener("input", () => {
    const searchValue = searchInput.value.toLowerCase().trim();

    const filteredProducts = cashierProducts.filter((product) =>
      product.productName?.toLowerCase().includes(searchValue),
    );

    RenderCashierProducts(filteredProducts);
  });

  const clearButton = document.getElementById("clear-product-search");

  clearButton?.addEventListener("click", () => {
    searchInput.value = "";

    RenderCashierProducts(cashierProducts);

    searchInput.focus();
  });
}

function InitializeBarcodeScanner() {
  if (isBarcodeListenerInitialized) {
    return;
  }

  isBarcodeListenerInitialized = true;

  let barcode = "";

  document.addEventListener("keydown", async (event) => {
    if (!GetIsCashRegisterMode()) {
      return;
    }

    if (event.key === "Enter") {
      const scannedBarcode = barcode.replace("ö", "0").replace("Ö", "0").trim();

      barcode = "";

      if (!scannedBarcode) {
        return;
      }

      const product = cashierProducts.find(
        (item) => item.barcode === scannedBarcode,
      );

      if (!product) {
        DisplayAlert("danger", "Nincs termék a beolvasott vonalkóddal!");

        return;
      }

      await SelectCashierProduct(product);

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

    if (event.key.length !== 1) {
      return;
    }

    barcode += event.key;
  });
}

async function LoadCashierProducts() {
  const response = await GetAllProductsForCashier();

  if (!response.success) {
    DisplayAlert("danger", response.error);

    return false;
  }

  cashierProducts = response.data ?? [];

  RenderCashierProducts(cashierProducts);

  return true;
}

function InitializeCashRegisterCloseEvent() {
  const modalElement = GetCashRegisterModal();

  if (!modalElement) {
    return;
  }

  modalElement.addEventListener("hidden.bs.modal", () => {
    SetIsCashRegisterMode(false);
  });
}

export function InitializeCashier() {
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  InitializeCart();
  InitializeCheckout();
  InitializeProductSearch();
  InitializeBarcodeScanner();
  InitializeCashRegisterCloseEvent();
}

export async function OpenCashRegister() {
  InitializeCashier();

  const loaded = await LoadCashierProducts();

  if (!loaded) {
    return;
  }

  SetIsCashRegisterMode(true);

  ShowCashRegisterModal();
}

export function CloseCashRegister() {
  SetIsCashRegisterMode(false);
}

export function OpenProductSearch() {
  return OpenProductSearchModal();
}

export function IsCashRegisterMode() {
  return GetIsCashRegisterMode();
}

export function SetCashRegisterMode(value) {
  SetIsCashRegisterMode(value);
}
