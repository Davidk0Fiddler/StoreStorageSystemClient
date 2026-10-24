import { StockDocumentsApi } from "./StockDocumentsApi.js";
import { NormalizeApiList } from "../NormalizeApiList.js";
import {
  RenderStockDocumentDeleteModal,
  RenderStockDocumentList,
  RenderStockDocumentViewer,
} from "./StockDocumentsUI.js";

const maxFileSize = 20 * 1024 * 1024;
let activeUrl = null;
let activeBlob = null;
let activeFileName = "";
let pendingDelete = null;

function responseError(response, fallback) {
  if (typeof response?.data === "string") return response.data;
  return (
    response?.data?.message ??
    response?.data?.error ??
    response?.data?.detail ??
    response?.data?.title ??
    fallback
  );
}

function setStatus(section, message, tone = "muted") {
  const element = section?.querySelector("[data-stock-document-status]");
  if (!element) return;

  const color = {
    muted: "text-body-secondary",
    success: "text-success",
    danger: "text-danger",
  }[tone] ?? "text-body-secondary";

  element.className = `small mb-2 ${color}`;
  element.textContent = message;
}

function getItems(response) {
  if (!response?.success) {
    throw new Error(
      typeof response?.data === "string"
        ? response.data
        : response?.data?.message ??
          response?.data?.detail ??
          response?.data?.title ??
          "A dokumentumlista betöltése sikertelen.",
    );
  }

  const items = NormalizeApiList(response.data);
  if (!items) {
    throw new Error("A backend nem dokumentumlistát adott vissza.");
  }
  return items;
}

export async function LoadStockDocumentsSection(section) {
  const list = section?.querySelector("[data-stock-document-list]");
  const stockId = section?.dataset.stockId;
  if (!section || !list || !stockId) return;

  list.innerHTML = '<div class="text-body-secondary small">Dokumentumok betöltése…</div>';
  try {
    list.innerHTML = RenderStockDocumentList(
      getItems(await StockDocumentsApi.list(stockId)),
    );
    setStatus(section, "");
  } catch (error) {
    list.innerHTML = '<div class="text-danger small">A dokumentumlista nem tölthető be.</div>';
    setStatus(section, error.message, "danger");
  }
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "dokumentum.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function closeViewer() {
  document.querySelector("[data-stock-document-viewer]")?.remove();
  if (activeUrl) URL.revokeObjectURL(activeUrl);
  activeUrl = null;
  activeBlob = null;
  activeFileName = "";
}

async function fetchDocument(documentId) {
  const result = await StockDocumentsApi.download(documentId);
  if (!result.success) throw new Error(result.error || "A PDF nem érhető el.");
  return result.data;
}

function requestDocumentDelete(section, documentId, fileName) {
  if (sessionStorage.getItem("roleName") !== "Admin") {
    setStatus(section, "A dokumentumok törléséhez Admin jogosultság szükséges.", "danger");
    return;
  }

  document.querySelector("[data-stock-document-delete-modal]")?.remove();
  pendingDelete = { section, documentId, fileName };
  document.body.insertAdjacentHTML(
    "beforeend",
    RenderStockDocumentDeleteModal(fileName),
  );
  const element = document.querySelector("[data-stock-document-delete-modal]");
  element.addEventListener("hidden.bs.modal", () => {
    bootstrap.Modal.getInstance(element)?.dispose();
    element.remove();
    pendingDelete = null;
  }, { once: true });
  bootstrap.Modal.getOrCreateInstance(element, { backdrop: "static" }).show();
}

async function confirmDocumentDelete(button) {
  const modalElement = button.closest("[data-stock-document-delete-modal]");
  const errorElement = modalElement?.querySelector("[data-stock-document-delete-error]");
  if (!pendingDelete || !modalElement) return;
  if (sessionStorage.getItem("roleName") !== "Admin") {
    if (errorElement) errorElement.textContent = "A törléshez Admin jogosultság szükséges.";
    return;
  }

  button.disabled = true;
  if (errorElement) errorElement.textContent = "Törlés folyamatban…";
  try {
    const response = await StockDocumentsApi.delete(pendingDelete.documentId);
    if (!response.success) {
      throw new Error(responseError(response, "A PDF törlése sikertelen."));
    }

    const { section, fileName } = pendingDelete;
    bootstrap.Modal.getInstance(modalElement)?.hide();
    pendingDelete = null;
    await LoadStockDocumentsSection(section);
    setStatus(section, `A(z) ${fileName} dokumentum törölve.`, "success");
  } catch (error) {
    if (errorElement) errorElement.textContent = error.message || "A PDF törlése sikertelen.";
    button.disabled = false;
  }
}

async function handleClick(event) {
  const deleteConfirmButton = event.target.closest("[data-stock-document-delete-confirm]");
  if (deleteConfirmButton) {
    await confirmDocumentDelete(deleteConfirmButton);
    return;
  }

  const deleteButton = event.target.closest("[data-stock-document-delete]");
  if (deleteButton) {
    requestDocumentDelete(
      deleteButton.closest("[data-stock-document-section]"),
      deleteButton.dataset.stockDocumentDelete,
      deleteButton.dataset.documentName,
    );
    return;
  }

  const uploadButton = event.target.closest("[data-stock-document-upload]");
  if (uploadButton) {
    const section = uploadButton.closest("[data-stock-document-section]");
    if (sessionStorage.getItem("roleName") !== "Admin") {
      setStatus(section, "A dokumentumok kezeléséhez Admin jogosultság szükséges.", "danger");
      return;
    }

    const input = section?.querySelector("[data-stock-document-file]");
    const file = input?.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf") || file.size > maxFileSize) {
      setStatus(section, "Csak legfeljebb 20 MB méretű PDF tölthető fel.", "danger");
      return;
    }

    uploadButton.disabled = true;
    setStatus(section, "PDF feltöltése folyamatban…");
    try {
      const response = await StockDocumentsApi.upload(section.dataset.stockId, file);
      if (!response.success) {
        throw new Error(responseError(response, "A PDF feltöltése sikertelen."));
      }
      input.value = "";
      section.querySelector("[data-stock-document-selected]").textContent = "Válassz ki egy PDF fájlt.";
      section.querySelector("[data-stock-document-upload]").disabled = true;
      await LoadStockDocumentsSection(section);
      setStatus(section, "A PDF sikeresen feltöltve.", "success");
    } catch (error) {
      setStatus(section, error.message, "danger");
    } finally {
      uploadButton.disabled = !input?.files?.length;
    }
    return;
  }

  const openButton = event.target.closest("[data-stock-document-open]");
  const downloadButton = event.target.closest("[data-stock-document-download]");
  if (!openButton && !downloadButton) {
    if (event.target.closest("[data-stock-document-close]")) closeViewer();
    if (event.target.closest("[data-stock-document-viewer-download]") && activeBlob) {
      downloadBlob(activeBlob, activeFileName);
    }
    return;
  }

  const button = openButton ?? downloadButton;
  try {
    const blob = await fetchDocument(button.dataset.stockDocumentOpen ?? button.dataset.stockDocumentDownload);
    const fileName = button.dataset.documentName || "dokumentum.pdf";
    if (downloadButton) {
      downloadBlob(blob, fileName);
      return;
    }
    closeViewer();
    activeBlob = blob;
    activeFileName = fileName;
    activeUrl = URL.createObjectURL(blob);
    document.body.insertAdjacentHTML("beforeend", RenderStockDocumentViewer(fileName));
    const viewer = document.querySelector("[data-stock-document-viewer]");
    viewer.querySelector("[data-stock-document-frame]").src = activeUrl;
    viewer.querySelector("[data-stock-document-viewer-download]").focus();
  } catch (error) {
    const section = button.closest("[data-stock-document-section]");
    if (section) setStatus(section, error.message, "danger");
    else console.error("A PDF dokumentum megnyitása sikertelen:", error);
  }
}

export function InitializeStockDocumentsFeature(root = document) {
  if (!root || root.dataset?.stockDocumentsInitialized === "true") return;
  if (root.dataset) root.dataset.stockDocumentsInitialized = "true";

  root.addEventListener("click", handleClick);
  root.addEventListener("change", (event) => {
    const input = event.target.closest("[data-stock-document-file]");
    if (!input) return;
    const section = input.closest("[data-stock-document-section]");
    const file = input.files?.[0];
    const upload = section?.querySelector("[data-stock-document-upload]");
    const selected = section?.querySelector("[data-stock-document-selected]");
    if (selected) selected.textContent = file?.name ?? "Válassz ki egy PDF fájlt.";
    if (upload) upload.disabled = !file;
    if (file && (!file.name.toLowerCase().endsWith(".pdf") || file.size > maxFileSize)) {
      setStatus(section, "Csak legfeljebb 20 MB méretű PDF tölthető fel.", "danger");
      if (upload) upload.disabled = true;
    } else {
      setStatus(section, "");
    }
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeViewer();
  });
}
