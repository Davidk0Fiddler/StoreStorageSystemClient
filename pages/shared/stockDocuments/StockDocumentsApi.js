import {
  API_CALL,
  GetRequestFailureMessage,
  HandleUnauthorizedResponse,
} from "../ApiCaller.js";

const stockPath = (stockId) =>
  `Admin/stocks/${encodeURIComponent(stockId)}/documents`;

export const StockDocumentsApi = Object.freeze({
  list: (stockId) => API_CALL(stockPath(stockId), "GET"),
  upload: (stockId, file) => {
    const formData = new FormData();
    formData.append("File", file);
    return API_CALL(stockPath(stockId), "POST", formData, null, true);
  },
  delete: (documentId) =>
    API_CALL(`Admin/documents/${encodeURIComponent(documentId)}`, "DELETE"),
  download: async (documentId) => {
    try {
      const response = await fetch(
        `${window.config.API_URL}/Admin/documents/${encodeURIComponent(documentId)}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        HandleUnauthorizedResponse(response.status);
        const contentType = response.headers.get("content-type") ?? "";
        const body = await response.text();
        let error = body;
        if (body && contentType.toLowerCase().includes("json")) {
          try {
            error = JSON.parse(body);
          } catch {
            error = body;
          }
        }
        const message = GetRequestFailureMessage(response.status, error);
        return {
          success: false,
          status: response.status,
          error: message,
          data: message,
        };
      }

      return { success: true, data: await response.blob() };
    } catch (error) {
      const message = GetRequestFailureMessage(0, error);
      return { success: false, status: 0, error: message, data: message };
    }
  },
});
