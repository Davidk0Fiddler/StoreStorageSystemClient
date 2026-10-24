import { AdminPanelApi } from "../api/AdminPanelApi.js";
import { NormalizeApiList } from "../../shared/NormalizeApiList.js";

function getError(response, fallback) {
  if (typeof response.error === "string") return response.error;
  if (typeof response.data === "string") return response.data;
  return (
    response.data?.message ??
    response.data?.error ??
    response.data?.detail ??
    response.data?.title ??
    fallback
  );
}

async function run(request, fallback) {
  try {
    const response = await request();
    if (!response.success) {
      return { success: false, error: getError(response, fallback) };
    }
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message || fallback };
  }
}

async function getList(request, fallback) {
  const result = await run(request, fallback);
  if (!result.success) return result;
  const items = NormalizeApiList(result.data);
  if (!items) {
    return { success: false, error: "A backend nem listát adott vissza." };
  }
  return { success: true, data: items };
}

export const AdminPanelService = Object.freeze({
  listProducts: (search) => getList(() => AdminPanelApi.getProducts(search), "A termékek betöltése sikertelen."),
  updateProduct: (sku, body) => run(() => AdminPanelApi.updateProduct(sku, body), "A termék módosítása sikertelen."),
  uploadProductImage: (sku, file, onProgress) => run(() => AdminPanelApi.uploadProductImage(sku, file, onProgress), "A termékkép feltöltése sikertelen."),
  setProductActive: (sku, active) => run(() => AdminPanelApi.setProductActive(sku, active), "A termék státuszának módosítása sikertelen."),

  listStocks: (search) => getList(() => AdminPanelApi.getStocks(search), "Az áruk betöltése sikertelen."),
  updateStock: (id, body) => run(() => AdminPanelApi.updateStock(id, body), "Az áru módosítása sikertelen."),
  setStockActive: (id, active) => run(() => AdminPanelApi.setStockActive(id, active), "Az áru státuszának módosítása sikertelen."),
  listStockDocuments: async (stockId) => {
    const result = await run(
      () => AdminPanelApi.getStockDocuments(stockId),
      "A készlettétel dokumentumainak betöltése sikertelen.",
    );
    if (!result.success) return result;

    const items = NormalizeApiList(result.data);
    if (!items) {
      return { success: false, error: "A backend nem dokumentumlistát adott vissza." };
    }
    return { success: true, data: items };
  },
  uploadStockDocument: (stockId, file) =>
    run(
      () => AdminPanelApi.uploadStockDocument(stockId, file),
      "A PDF feltöltése sikertelen.",
    ),
  deleteStockDocument: (documentId) =>
    run(
      () => AdminPanelApi.deleteStockDocument(documentId),
      "A PDF törlése sikertelen.",
    ),
  downloadDocument: (documentId) =>
    run(
      () => AdminPanelApi.downloadDocument(documentId),
      "A dokumentum letöltése sikertelen.",
    ),

  listProfiles: (search) => getList(() => AdminPanelApi.getProfiles(search), "A profilok betöltése sikertelen."),
  updateProfile: (userName, body) => run(() => AdminPanelApi.updateProfile(userName, body), "A profil módosítása sikertelen."),
  setProfileActive: (userName, active) => run(() => AdminPanelApi.setProfileActive(userName, active), "A profil státuszának módosítása sikertelen."),

  listLogs: (kind, filters) => {
    const requests = {
      shoplog: AdminPanelApi.getShopLogs,
      auditlog: AdminPanelApi.getAuditLogs,
      storagemovinglog: AdminPanelApi.getStorageMovingLogs,
    };
    const request = requests[kind];
    if (!request) return Promise.resolve({ success: false, error: "Ismeretlen naplótípus." });
    return run(() => request(filters), "A naplók betöltése sikertelen.");
  },
});
