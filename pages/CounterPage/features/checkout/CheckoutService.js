import { CounterAPIs } from "../../api/CounterAPI.js";

import {
  GetCheckoutProducts,
  SetCheckoutProducts,
  GetCheckoutTotal,
  SetCheckoutTotal,
  ClearCheckout,
} from "./CheckoutState.js";

export function PrepareCheckout(products) {
  SetCheckoutProducts(products);

  let total = 0;

  products.forEach((item) => {
    total +=
      item.product.unitPrice * item.amount + item.product.deposit * item.amount;
  });

  SetCheckoutTotal(total);
}

export function GetProductsForCheckout() {
  return GetCheckoutProducts();
}

export function GetTotalForCheckout() {
  return GetCheckoutTotal();
}

export function CreateSavePurchaseRequest() {
  const products = GetCheckoutProducts();

  return products.map((item) => ({
    SKU: item.product.sku,
    Quantity: item.amount,
  }));
}

export async function SaveCheckoutPurchase() {
  const requestBody = CreateSavePurchaseRequest();

  const response = await CounterAPIs.SendSavePurchaseRequest(requestBody);

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Hiba történt a vásárlás mentésekor.",
    };
  }

  return {
    success: true,
    data: response.data,
  };
}

export function ClearCheckoutData() {
  ClearCheckout();
}
