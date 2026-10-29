import { ResolveProductThumbnailUrl } from "../../../shared/ProductImage.js";
import { EscapeHtml } from "../../../shared/Html.js";
import {
  GetIsCashRegisterMode,
  SetIsCashRegisterMode,
  GetBuyerAgeStatus,
  SetBuyerAgeStatus,
  ResetBuyerAgeStatus,
} from "./CashierState.js";

import { GetAllProductsForCashier } from "./CashierService.js";

import { AddToCart, InitializeCart } from "../cart/CartFeature.js";

import { OpenProductSearchModal } from "../productSearch/ProductSearchFeature.js";

import { InitializeCheckout } from "../checkout/CheckoutFeature.js";

import {
  GetCashRegisterModal,
  GetCashierBarcodeInput,
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
  AskBuyerAge,
} from "../../ui/cashier/CashierPanel.js";

import { DisplayAlert } from "../../../shared/Alert.js";
import { NormalizeBarcode } from "../../../shared/NormalizeBarcode.js";
import { RenderProductAgeRestrictionSticker } from "../../../shared/ProductAgeRestrictionSticker.js";

let cashierProducts = [];
let quantityModal = null;
let barcodeBuffer = "";

let isInitialized = false;
let isBarcodeListenerInitialized = false;

function productCanBePurchasedByMinors(product) {
  const value = product?.canBePurchasedByMinors;
  return value !== false && value !== 0 && String(value).toLowerCase() !== "false";
}

async function EnsureBuyerCanPurchase(product) {
  const buyerAgeStatus = GetBuyerAgeStatus();
  if (productCanBePurchasedByMinors(product) || buyerAgeStatus === "adult") return true;
  if (buyerAgeStatus === "minor") {
    DisplayAlert("danger", "A kiskorú vásárló ezt a terméket nem vásárolhatja meg.");
    return false;
  }
  const decision = await AskBuyerAge();
  if (decision === "adult") {
    SetBuyerAgeStatus("adult");
    return true;
  }
  if (decision === "minor") {
    SetBuyerAgeStatus("minor");
    DisplayAlert("danger", "A kiskorú vásárló ezt a terméket nem vásárolhatja meg.");
  }
  return false;
}

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
    card.classList.add("card", "h-100", "border-0", "rounded", "position-relative");

    card.style.cursor = "pointer";

    card.innerHTML = `
      ${RenderProductAgeRestrictionSticker(product)}
      <img
        data-product-image="true"
        src="${EscapeHtml(ResolveProductThumbnailUrl(product.thumbnailURL || product.thumbnailUrl || product.productThumbnailURL || product.productThumbnailUrl, product.imageURL || product.productImageURL))}"
        alt="${EscapeHtml(product.productName ?? "Termék")}"
        class="card-img-top object-fit-contain p-2"
        style="height: 140px;"
        loading="lazy"
        decoding="async"
      >

      <div
        class="card-body d-flex align-items-center justify-content-center p-2"
      >
        <div class="fw-semibold text-center">
          ${EscapeHtml(product.productName ?? "Ismeretlen termék")}
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
  if (!(await EnsureBuyerCanPurchase(product))) return false;
  await AddToCart(product, quantity);
  return true;
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

  if (!(await EnsureBuyerCanPurchase(product))) return;

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

  searchInput.addEventListener("blur", () => {
    window.setTimeout(() => {
      const quantityModalIsOpen = GetQuantityModal()?.classList.contains("show");
      const ageModalIsOpen = document
        .getElementById("buyer-age-confirmation-modal")
        ?.classList.contains("show");
      if (GetIsCashRegisterMode() && !quantityModalIsOpen && !ageModalIsOpen) {
        GetCashierBarcodeInput()?.focus({ preventScroll: true });
      }
    }, 0);
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

  document.addEventListener("keydown", async (event) => {
    if (!GetIsCashRegisterMode()) {
      return;
    }

    const target = event.target;
    const isEditableTarget =
      target instanceof HTMLElement &&
      (target.isContentEditable || target.matches("input, textarea, select"));
    if (isEditableTarget && target !== GetCashierBarcodeInput()) {
      barcodeBuffer = "";
      return;
    }

    if (event.key === "Enter") {
      const scannedBarcode = NormalizeBarcode(barcodeBuffer);

      barcodeBuffer = "";
      const barcodeInput = GetCashierBarcodeInput();
      if (barcodeInput) barcodeInput.value = "";

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

    barcodeBuffer += event.key;
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
    ResetBuyerAgeStatus();
    barcodeBuffer = "";
  });
  modalElement.addEventListener("shown.bs.modal", () => {
    GetCashierBarcodeInput()?.focus({ preventScroll: true });
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
  ResetBuyerAgeStatus();
  barcodeBuffer = "";

  const loaded = await LoadCashierProducts();

  if (!loaded) {
    return;
  }

  SetIsCashRegisterMode(true);

  ShowCashRegisterModal();
}

export function CloseCashRegister() {
  SetIsCashRegisterMode(false);
  ResetBuyerAgeStatus();
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
