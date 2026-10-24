import { CounterAPIs } from "../../api/CounterAPI.js";
import { NormalizeApiList } from "../../../shared/NormalizeApiList.js";

export async function GetAllProducts() {
  const response = await CounterAPIs.RequestAllProducts();

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Nem sikerült lekérni a termékeket.",
    };
  }

  const products = NormalizeApiList(response.data);
  if (!products) return { success: false, error: "A backend nem terméklistát adott vissza." };

  return {
    success: true,
    data: products,
  };
}

export async function GetAllProductsForCashier() {
  const response = await CounterAPIs.RequestAllProductsForCashier();

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Nem sikerült lekérni a pénztár termékeit.",
    };
  }

  const products = NormalizeApiList(response.data);
  if (!products) return { success: false, error: "A backend nem pénztári terméklistát adott vissza." };

  return {
    success: true,
    data: products,
  };
}

export async function CheckProductAvailability(sku, quantity) {
  const response = await CounterAPIs.SendIsProductAvailableForCashierRequest({
    sku,
    quantity: Number(quantity),
  });

  if (!response.success) {
    return {
      success: false,
      error:
        response.data ?? "Nem sikerült ellenőrizni a termék elérhetőségét.",
    };
  }

  return {
    success: true,
    data: response.data,
  };
}

export async function SavePurchase(requestBody) {
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
