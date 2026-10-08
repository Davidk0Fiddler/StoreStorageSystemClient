import { API_CALL } from "../../shared/ApiCaller.js";

export const CounterAPIs = {
  RequestAllProducts: () => API_CALL("Products", "GET"),

  RequestAllProductsForCashier: () => API_CALL("GetProductsForCashier", "GET"),

  SendIsProductAvailableForCashierRequest: (requestBody) =>
    API_CALL("IsProductAvailableForCashier", "POST", requestBody),

  SendSavePurchaseRequest: (requestBody) =>
    API_CALL("SavePurchase", "POST", requestBody),
};
