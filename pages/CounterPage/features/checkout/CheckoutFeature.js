import { GetCart } from "../cart/CartFeature.js";

import {
  PrepareCheckout,
  GetProductsForCheckout,
  GetTotalForCheckout,
  ClearCheckoutData,
  SaveCheckoutPurchase,
} from "./CheckoutService.js";

import {
  SetCheckoutDate,
  ClearReceiptItems,
  SetProductsCount,
  SetTotalPrice,
  ShowCheckoutModal,
  GetSavePurchaseButton,
  CloseCheckoutModal,
  GetReceiptItemsArea,
} from "../../ui/checkout/CheckoutPanel.js";

import { RenderVATSummary } from "../../ui/checkout/VATSummary.js";

import { CreateReceiptItem } from "../../ui/checkout/Receipt.js";

import { ClearSelectedProducts } from "../cart/CartFeature.js";

import { DisplayAlert } from "../../../shared/Alert.js";

function GetCurrentDateTime() {
  const now = new Date();

  return (
    now.getFullYear() +
    "." +
    String(now.getMonth() + 1).padStart(2, "0") +
    "." +
    String(now.getDate()).padStart(2, "0") +
    ". " +
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0")
  );
}

function CalculateCheckoutTotals(products) {
  let productsAmount = 0;
  let totalPrice = 0;

  let afa27 = 0;
  let afa18 = 0;
  let afa5 = 0;
  let afa0 = 0;

  products.forEach((selectedProduct) => {
    const product = selectedProduct.product;
    const amount = selectedProduct.amount;

    const productTotal = amount * product.unitPrice;

    const depositTotal = amount * product.deposit;

    productsAmount += amount;

    totalPrice += productTotal + depositTotal;

    switch (product.afaPercent) {
      case 27:
        afa27 += productTotal;
        break;

      case 18:
        afa18 += productTotal;
        break;

      case 5:
        afa5 += productTotal;
        break;

      case 0:
        afa0 += productTotal;
        break;
    }

    if (product.deposit != 0) {
      afa0 += depositTotal;
    }
  });

  return {
    productsAmount,
    totalPrice,
    afa27,
    afa18,
    afa5,
    afa0,
  };
}

function RenderCheckout(products) {
  const receiptItemsArea = GetReceiptItemsArea();

  if (!receiptItemsArea) {
    return;
  }

  ClearReceiptItems();

  products.forEach((selectedProduct) => {
    receiptItemsArea.innerHTML += CreateReceiptItem(selectedProduct);
  });

  const totals = CalculateCheckoutTotals(products);

  SetProductsCount(totals.productsAmount);

  SetTotalPrice(totals.totalPrice);

  RenderVATSummary({
    afa27: totals.afa27,
    afa18: totals.afa18,
    afa5: totals.afa5,
    afa0: totals.afa0,
  });
}

export function OpenCheckout() {
  const cartProducts = GetCart();

  if (!cartProducts || cartProducts.length === 0) {
    DisplayAlert("danger", "Hiba! Nincs termék a kosárban!");

    return false;
  }

  PrepareCheckout(cartProducts);

  const products = GetProductsForCheckout();

  SetCheckoutDate(GetCurrentDateTime());

  RenderCheckout(products);

  ShowCheckoutModal();

  return true;
}

export function GetCheckoutProducts() {
  return GetProductsForCheckout();
}

export function GetCheckoutTotal() {
  return GetTotalForCheckout();
}

export function CloseCheckout() {
  ClearCheckoutData();
}

export async function SaveCheckout() {
  const products = GetProductsForCheckout();

  if (!products || products.length === 0) {
    DisplayAlert("danger", "Hiba! Nincs termék kiválasztva!");

    return false;
  }

  const response = await SaveCheckoutPurchase();

  if (!response.success) {
    DisplayAlert("danger", `Hiba! ${response.error}`);

    return false;
  }

  DisplayAlert("success", "Sikeres mentés!");

  ClearSelectedProducts();
  ClearCheckoutData();

  return true;
}

let isInitialized = false;

function InitializeCheckoutEvents() {
  if (isInitialized) {
    return;
  }

  isInitialized = true;

  const checkoutButton = document.getElementById("checkout-button");

  checkoutButton?.addEventListener("click", OpenCheckout);

  const savePurchaseButton = GetSavePurchaseButton();

  savePurchaseButton?.addEventListener("click", async () => {
    const success = await SaveCheckout();

    if (!success) {
      return;
    }

    CloseCheckoutModal();
  });
}

export function InitializeCheckout() {
  InitializeCheckoutEvents();
}
