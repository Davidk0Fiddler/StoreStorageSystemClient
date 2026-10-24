import { AddStockAPIs } from "../../api/AddStockAPIs.js";
import { NormalizeApiList } from "../../../shared/NormalizeApiList.js";

export async function GetProductByBarcode(barcode) {
  const response = await AddStockAPIs.RequestProductByBarcode(barcode);

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Nem található termék a megadott vonalkóddal.",
    };
  }

  return {
    success: true,
    data: response.data,
  };
}

export async function GetProductBySKU(sku) {
  const response = await AddStockAPIs.RequestProductBySKU(sku);

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Nem sikerült lekérni a termék adatait.",
    };
  }

  return {
    success: true,
    data: response.data,
  };
}

export async function GetProducts() {
  const response = await AddStockAPIs.RequestAllProductsForListing();

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Nem sikerült lekérni a termékeket.",
    };
  }

  const products = NormalizeApiList(response.data);

  if (!products) {
    return {
      success: false,
      error: "A backend nem terméklistát adott vissza.",
    };
  }

  return {
    success: true,
    data: products,
  };
}

export async function AddStock(stockData) {
  const response = await AddStockAPIs.SendAddStockRequest(stockData);

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Hiba történt az áru hozzáadásakor.",
    };
  }

  return {
    success: true,
    data: response.data,
  };
}

export async function GetStockListing() {
  const response = await AddStockAPIs.RequestAllStocksListing();
  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Nem sikerült lekérni a készlettételeket.",
    };
  }

  const items = NormalizeApiList(response.data);
  return items
    ? { success: true, data: items }
    : { success: false, error: "A backend nem készletlistát adott vissza." };
}
