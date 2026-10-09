import { API_CALL } from "../../shared/ApiCaller.js";

export const StockAPIs = {
  RequestAllStocksListing: () => API_CALL("Stocks/listing", "GET"),

  RequestStockById: (id) => API_CALL("Stocks", "GET", null, id),

  SendUpdateStockShopQuantityRequest: (requestBody) =>
    API_CALL("Stocks/shopquantity", "PUT", requestBody),

  SendUpdateStockPriceRequest: (requestBody) =>
    API_CALL("Stocks/price", "PUT", requestBody),
};
