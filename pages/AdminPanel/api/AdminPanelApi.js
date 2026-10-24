import { API_CALL } from "../../shared/ApiCaller.js";
import { StockDocumentsApi } from "../../shared/stockDocuments/StockDocumentsApi.js";

function buildQuery(values) {
  const search = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  return search.toString();
}

function withSearch(path, search) {
  const query = buildQuery({ search });
  return `${path}${query ? `?${query}` : ""}`;
}

export const AdminPanelApi = Object.freeze({
  getProducts: (search) => API_CALL(withSearch("Admin/products", search), "GET"),
  updateProduct: (sku, body) => API_CALL(`Admin/products/${encodeURIComponent(sku)}`, "PUT", body),
  uploadProductImage: (sku, file, onProgress) => {
    const formData = new FormData();
    formData.append("Image", file);
    return API_CALL(`Admin/products/${encodeURIComponent(sku)}/image`, "PUT", formData, null, true, onProgress);
  },
  setProductActive: (sku, isActive) => API_CALL(`Admin/products/${encodeURIComponent(sku)}/status`, "PATCH", { isActive }),

  getStocks: (search) => API_CALL(withSearch("Admin/stocks", search), "GET"),
  updateStock: (id, body) => API_CALL(`Admin/stocks/${encodeURIComponent(id)}`, "PUT", body),
  setStockActive: (id, isActive) => API_CALL(`Admin/stocks/${encodeURIComponent(id)}/status`, "PATCH", { isActive }),
  getStockDocuments: (stockId) => StockDocumentsApi.list(stockId),
  uploadStockDocument: (stockId, file) => StockDocumentsApi.upload(stockId, file),
  deleteStockDocument: (documentId) => StockDocumentsApi.delete(documentId),
  downloadDocument: (documentId) => StockDocumentsApi.download(documentId),

  getProfiles: (search) => API_CALL(withSearch("Admin/profiles", search), "GET"),
  updateProfile: (userName, body) => API_CALL(`Admin/profiles/${encodeURIComponent(userName)}`, "PUT", body),
  setProfileActive: (userName, isActive) => API_CALL(`Admin/profiles/${encodeURIComponent(userName)}/status`, "PATCH", { isActive }),

  getShopLogs: (filters) => API_CALL(`Admin/logs/shop?${buildQuery(filters)}`, "GET"),
  getAuditLogs: (filters) => API_CALL(`Admin/logs/audit?${buildQuery(filters)}`, "GET"),
  getStorageMovingLogs: (filters) => API_CALL(`Admin/logs/storage-movements?${buildQuery(filters)}`, "GET"),
});
