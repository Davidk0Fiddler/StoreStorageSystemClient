import { StockAPIs } from "../api/StockAPIs.js";
import { NormalizeApiList } from "../../shared/NormalizeApiList.js";

export async function GetAllStocks() {
  const response = await StockAPIs.RequestAllStocksListing();

  if (!response.success) {
    console.error("Készletek lekérése sikertelen:", response);
    return null;
  }

  const stocks = NormalizeApiList(response.data);
  if (!stocks) {
    console.error("A backend nem készletlistát adott vissza:", response.data);
    return null;
  }
  return stocks;
}

export async function GetStockById(id) {
  const response = await StockAPIs.RequestStockById(id);

  if (!response.success) {
    console.error("Készlet lekérése sikertelen:", response);
    return null;
  }

  return response.data;
}

async function HandleStockUpdate(apiCall) {
  const response = await apiCall();

  if (!response.success) {
    return {
      success: false,
      message:
        typeof response.data === "string"
          ? response.data
          : "A művelet sikertelen.",
    };
  }

  return {
    success: true,
    data: response.data,
  };
}

export async function UpdateStockShopQuantity(requestBody) {
  return HandleStockUpdate(() =>
    StockAPIs.SendUpdateStockShopQuantityRequest(requestBody),
  );
}

export async function UpdateStockPrice(requestBody) {
  return HandleStockUpdate(() =>
    StockAPIs.SendUpdateStockPriceRequest(requestBody),
  );
}
