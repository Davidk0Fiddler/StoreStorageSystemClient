import { CounterAPIs } from "../../api/CounterAPI.js";

export async function GetAllProducts() {
  const response = await CounterAPIs.RequestAllProducts();

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Nem sikerült lekérni a termékeket.",
    };
  }

  return {
    success: true,
    data: response.data,
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

  return {
    success: true,
    data: response.data,
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
