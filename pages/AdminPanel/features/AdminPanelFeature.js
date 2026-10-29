import { AdminPanelService } from "./AdminPanelService.js";
import {
  IsValidProductImageFile,
  ResolveProductImageUrl,
  SetProductImagePreview,
  SetProductImageSource,
} from "../../shared/ProductImage.js";
import {
  RenderAdminConfirmModal,
  RenderAdminEditModal,
  RenderAdminLogDetails,
  RenderAdminNoticeModal,
  RenderAdminPanel,
} from "../ui/AdminPanelUI.js";
import {
  RenderStockDocumentList,
  RenderStockDocumentViewer,
} from "../ui/StockDocumentsUI.js";
import { IsProtectedAdministratorProfile } from "../../shared/ProfilePolicy.js";

const root = document.getElementById("admin-panel-root");
const pageSize = 25;
let loadSequence = 0;
let activeStockDocumentUrl = null;
let activeStockDocumentBlob = null;
let activeStockDocumentFileName = "";

function toISODate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shiftLocalDate(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

const state = {
  panel: null,
  items: [],
  loading: false,
  error: "",
  search: "",
  logType: "shoplog",
  from: shiftLocalDate(-1),
  to: shiftLocalDate(1),
  page: 1,
  total: 0,
  pageCount: 1,
};

function render() {
  root.innerHTML = RenderAdminPanel(state.panel, state);
  root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((element) => {
    bootstrap.Tooltip.getOrCreateInstance(element);
  });
}

function getIdentity(item) {
  if (state.panel === "products") return String(item.sku);
  if (state.panel === "stocks") {
    return String(item.stockId ?? item.stock?.stockId ?? item.id ?? item.stock?.id);
  }
  return String(item.userName);
}

async function loadPanel() {
  const sequence = ++loadSequence;
  if (!state.panel || state.panel === "logs") {
    if (state.panel === "logs") await loadLogs();
    else render();
    return;
  }

  state.loading = true;
  state.error = "";
  render();

  const loaders = {
    products: AdminPanelService.listProducts,
    stocks: AdminPanelService.listStocks,
    profiles: AdminPanelService.listProfiles,
  };
  const result = await loaders[state.panel](state.search);
  if (sequence !== loadSequence) return;
  state.loading = false;

  if (!result.success) {
    state.items = [];
    state.error = result.error;
  } else {
    state.items = state.panel === "profiles"
      ? result.data.filter((profile) => !IsProtectedAdministratorProfile(profile))
      : result.data;
  }
  render();
}

async function loadLogs() {
  const sequence = ++loadSequence;
  state.loading = true;
  state.error = "";
  render();

  const filters = {
    from: state.from,
    to: state.to,
    page: state.page,
    pageSize,
  };
  const result = await AdminPanelService.listLogs(state.logType, filters);
  if (sequence !== loadSequence) return;
  state.loading = false;

  if (!result.success) {
    state.items = [];
    state.error = result.error;
    state.total = 0;
    state.pageCount = 1;
  } else {
    const payload = result.data;
    state.items = Array.isArray(payload) ? payload : payload?.items ?? [];
    state.total = payload?.totalCount ?? state.items.length;
    state.pageCount = payload?.pageCount ?? Math.max(1, Math.ceil(state.total / pageSize));
  }
  render();
}

function getPanelItem(identity) {
  return state.items.find((item) => getIdentity(item) === String(identity));
}

function showEditModal(item) {
  root.querySelector("#admin-edit-modal")?.remove();
  root.insertAdjacentHTML("beforeend", RenderAdminEditModal(state.panel, item));
  const modalElement = root.querySelector("#admin-edit-modal");
  modalElement.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((element) => {
    bootstrap.Tooltip.getOrCreateInstance(element);
  });
  modalElement.addEventListener("hidden.bs.modal", () => {
    const refreshProducts = modalElement.dataset.refreshProductsOnClose === "true";
    const preview = modalElement.querySelector("[data-admin-product-image-preview]");
    if (preview?.dataset.previewObjectUrl) {
      URL.revokeObjectURL(preview.dataset.previewObjectUrl);
    }
    bootstrap.Modal.getInstance(modalElement)?.dispose();
    modalElement.remove();
    if (refreshProducts && state.panel === "products") void loadPanel();
  }, { once: true });
  bootstrap.Modal.getOrCreateInstance(modalElement).show();

  if (state.panel === "stocks") {
    void loadStockDocuments(getIdentity(item));
  }
}

function setStockDocumentStatus(section, message, type = "muted") {
  const status = section?.querySelector("[data-stock-document-status]");
  if (!status) return;

  const classes = {
    muted: "text-body-secondary",
    success: "text-success",
    danger: "text-danger",
  };
  status.className = `small mb-2 ${classes[type] ?? classes.muted}`;
  status.textContent = message;
}

async function loadStockDocuments(stockId) {
  const section = root.querySelector("[data-stock-document-section]");
  const list = section?.querySelector("[data-stock-document-list]");
  if (!section || !list) return;

  list.innerHTML = '<div class="text-body-secondary small">Dokumentumok betöltése…</div>';
  const result = await AdminPanelService.listStockDocuments(stockId);
  if (!result.success) {
    list.textContent = "A dokumentumlista nem tölthető be.";
    list.className = "text-danger small";
    setStockDocumentStatus(section, result.error, "danger");
    return;
  }

  list.className = "";
  list.innerHTML = RenderStockDocumentList(result.data);
  setStockDocumentStatus(section, "");
}

function isValidStockDocument(file) {
  return Boolean(
    file &&
      file.name.toLowerCase().endsWith(".pdf") &&
      file.size <= 20 * 1024 * 1024,
  );
}

async function uploadStockDocument(button) {
  const section = button.closest("[data-stock-document-section]");
  const fileInput = section?.querySelector("[data-stock-document-file]");
  const file = fileInput?.files?.[0];
  const stockId = section?.dataset.stockId;

  if (!section || !file || !stockId) return;
  if (!isValidStockDocument(file)) {
    setStockDocumentStatus(
      section,
      "Csak legfeljebb 20 MB méretű PDF tölthető fel.",
      "danger",
    );
    return;
  }

  button.disabled = true;
  setStockDocumentStatus(section, "PDF feltöltése folyamatban…");
  const result = await AdminPanelService.uploadStockDocument(stockId, file);
  if (!result.success) {
    button.disabled = false;
    setStockDocumentStatus(section, result.error, "danger");
    return;
  }

  fileInput.value = "";
  section.querySelector("[data-stock-document-selected]").textContent =
    "Válassz ki egy PDF fájlt.";
  setStockDocumentStatus(section, "A PDF sikeresen feltöltve.", "success");
  await loadStockDocuments(stockId);
  setStockDocumentStatus(section, "A PDF sikeresen feltöltve.", "success");
  section.querySelector("[data-stock-document-upload]").disabled = true;
}

async function deleteStockDocument(button) {
  const section = button.closest("[data-stock-document-section]");
  const documentId = button.dataset.stockDocumentDelete;
  const fileName = button.dataset.documentName || "a kiválasztott PDF dokumentum";
  if (!section || !documentId) return;
  if (sessionStorage.getItem("roleName") !== "Admin") {
    setStockDocumentStatus(section, "A dokumentum törléséhez Admin jogosultság szükséges.", "danger");
    return;
  }

  const confirmed = await confirmAdminAction({
    title: "PDF végleges törlése",
    message: `Biztosan törlöd ezt a dokumentumot?\n${fileName}\nA művelet nem vonható vissza.`,
    icon: "bi-trash3",
    confirmLabel: "PDF törlése",
    danger: true,
  });
  if (!confirmed) return;

  button.disabled = true;
  setStockDocumentStatus(section, "PDF törlése folyamatban…");
  const result = await AdminPanelService.deleteStockDocument(documentId);
  if (!result.success) {
    button.disabled = false;
    setStockDocumentStatus(section, result.error, "danger");
    return;
  }

  await loadStockDocuments(section.dataset.stockId);
  setStockDocumentStatus(section, "A PDF sikeresen törölve.", "success");
}

async function fetchStockDocument(documentId) {
  const result = await AdminPanelService.downloadDocument(documentId);
  if (!result.success) {
    showAdminNotice("danger", "A dokumentum nem érhető el", result.error);
    return null;
  }
  return result.data;
}

function downloadBlob(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName || "dokumentum.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

async function downloadStockDocument(documentId, fileName) {
  const blob = await fetchStockDocument(documentId);
  if (!blob) return;
  downloadBlob(blob, fileName);
}

async function openStockDocument(documentId, fileName) {
  const blob = await fetchStockDocument(documentId);
  if (!blob) return;

  closeStockDocumentViewer();
  activeStockDocumentBlob = blob;
  activeStockDocumentUrl = URL.createObjectURL(blob);
  activeStockDocumentFileName = fileName || "dokumentum.pdf";
  root.insertAdjacentHTML(
    "beforeend",
    RenderStockDocumentViewer(activeStockDocumentFileName),
  );
  const viewer = root.querySelector("[data-stock-document-viewer]");
  viewer.querySelector("[data-stock-document-frame]").src = activeStockDocumentUrl;
  viewer.querySelector("[data-stock-document-viewer-download]").focus();
}

function closeStockDocumentViewer() {
  root.querySelector("[data-stock-document-viewer]")?.remove();
  if (activeStockDocumentUrl) URL.revokeObjectURL(activeStockDocumentUrl);
  activeStockDocumentUrl = null;
  activeStockDocumentBlob = null;
  activeStockDocumentFileName = "";
}

function handleStockDocumentFileChange(input) {
  const section = input.closest("[data-stock-document-section]");
  const file = input.files?.[0];
  const uploadButton = section?.querySelector("[data-stock-document-upload]");
  const selectedLabel = section?.querySelector("[data-stock-document-selected]");
  if (!section || !uploadButton || !selectedLabel) return;

  uploadButton.disabled = !isValidStockDocument(file);
  if (!file) {
    selectedLabel.textContent = "Válassz ki egy PDF fájlt.";
    setStockDocumentStatus(section, "");
    return;
  }

  selectedLabel.textContent = `${file.name} · ${(file.size / (1024 * 1024)).toFixed(2)} MB`;
  setStockDocumentStatus(
    section,
    isValidStockDocument(file)
      ? "A fájl feltölthető."
      : "Csak legfeljebb 20 MB méretű PDF tölthető fel.",
    isValidStockDocument(file) ? "muted" : "danger",
  );
}

function confirmAdminAction({ title, message, icon, confirmLabel = "Folytatás", danger = true }) {
  root.querySelector("#admin-confirm-modal")?.remove();
  root.insertAdjacentHTML("beforeend", RenderAdminConfirmModal({
    title,
    message,
    icon,
    confirmLabel,
    danger,
  }));

  const modalElement = root.querySelector("#admin-confirm-modal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement, { backdrop: "static" });

  return new Promise((resolve) => {
    let confirmed = false;
    modalElement.querySelector("[data-confirm-action]").addEventListener("click", () => {
      confirmed = true;
      modal.hide();
    });
    modalElement.addEventListener("hidden.bs.modal", () => {
      modal.dispose();
      modalElement.remove();
      resolve(confirmed);
    }, { once: true });
    modal.show();
  });
}

function valuesFromForm(form) {
  const values = Object.fromEntries(new FormData(form).entries());
  for (const [key, value] of Object.entries(values)) {
    if (["quantity", "shopQuantity", "currentPrice", "importPrice", "depositAmount", "roleId"].includes(key)) {
      values[key] = value === "" ? null : Number(value);
    }
  }
  form.querySelectorAll('input[type="checkbox"][name]').forEach((input) => {
    values[input.name] = input.checked;
  });
  return values;
}

async function saveEdit(form) {
  const kind = form.dataset.adminKind;
  const identity = form.dataset.adminId;
  if (kind === "profiles" && IsProtectedAdministratorProfile(identity)) {
    showAdminNotice("danger", "A profil nem módosítható", "Az Administrator profil védett rendszerprofil.");
    return;
  }
  const pendingProductImage = kind === "products"
    ? form.querySelector("[data-admin-product-image]")?.files?.[0]
    : null;
  if (pendingProductImage) {
    setProductImageStatus(
      form,
      "A kiválasztott kép még nincs feltöltve. Kattints külön a Kép feltöltése gombra.",
      "danger",
    );
    return;
  }

  const values = valuesFromForm(form);
  const entityName = kind === "products" ? "terméket" : kind === "stocks" ? "árutételt" : "profilt";
  const confirmed = await confirmAdminAction({
    title: "Adatok felülírása",
    message: `Biztosan felülírod a(z) ${identity} azonosítójú ${entityName}? A módosítás naplózásra kerül.`,
    icon: "bi-pencil-square",
    confirmLabel: "Adatok felülírása",
  });
  if (!confirmed) return;
  const modalElement = root.querySelector("#admin-edit-modal");
  const modal = bootstrap.Modal.getInstance(modalElement);

  const actions = {
    products: () => AdminPanelService.updateProduct(identity, values),
    stocks: () => AdminPanelService.updateStock(identity, values),
    profiles: () => AdminPanelService.updateProfile(identity, {
      oldUserName: identity,
      userName: values.userName,
      roleId: values.roleId,
    }),
  };

  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  const result = await actions[kind]();
  submit.disabled = false;

  if (!result.success) {
    showAdminNotice("danger", "A mentés nem sikerült", result.error);
    return;
  }

  if (modal && modalElement) {
    await new Promise((resolve) => {
      modalElement.addEventListener("hidden.bs.modal", resolve, { once: true });
      modal.hide();
    });
  }
  await loadPanel();
}

function previewProductImage(input) {
  const file = input.files?.[0];
  const preview = input.closest("form")?.querySelector("[data-admin-product-image-preview]");
  if (!preview) return;
  SetProductImagePreview(preview, file, preview.dataset.originalSrc ?? "");
}

function setProductImageStatus(form, message, type = "muted") {
  const status = form.querySelector("[data-admin-product-image-status]");
  if (!status) return;

  status.className = `small mt-2 ${type === "danger" ? "text-danger" : type === "success" ? "text-success" : "text-body-secondary"}`;
  status.textContent = message;
}

async function uploadAdminProductImage(button) {
  const form = button.closest("[data-admin-edit-form]");
  if (!form) return;

  const sku = form.dataset.adminId;
  const input = form.querySelector("[data-admin-product-image]");
  const file = input?.files?.[0];
  if (!file) {
    setProductImageStatus(form, "Válassz ki egy képfájlt a feltöltéshez.", "danger");
    input?.focus();
    return;
  }
  if (!IsValidProductImageFile(file)) {
    setProductImageStatus(
      form,
      "JPG, PNG, GIF, WebP vagy BMP képet válassz, legfeljebb 10 MB méretben.",
      "danger",
    );
    return;
  }

  const confirmed = await confirmAdminAction({
    title: "Termékkép cseréje",
    message: `Biztosan lecseréled a(z) ${sku} termék képét?`,
    icon: "bi-image",
    confirmLabel: "Kép feltöltése",
    danger: false,
  });
  if (!confirmed) return;

  button.disabled = true;
  const saveButton = form.querySelector('[type="submit"]');
  if (saveButton) saveButton.disabled = true;
  input.disabled = true;
  const previousContent = button.innerHTML;
  button.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Feltöltés…';
  setProductImageStatus(form, "A képfeltöltés folyamatban van…");

  const progressContainer = form.querySelector("[data-admin-image-progress]");
  const progressBar = form.querySelector("[data-admin-image-progress-bar]");
  progressContainer?.classList.remove("d-none");
  if (progressBar) {
    progressBar.style.width = "0%";
  }
  progressContainer?.setAttribute("aria-valuenow", "0");
  let result;
  try {
    result = await AdminPanelService.uploadProductImage(sku, file, ({ percent }) => {
      const progress = Math.max(0, Math.min(100, Number(percent) || 0));
      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }
      progressContainer?.setAttribute("aria-valuenow", String(progress));
      setProductImageStatus(form, `Képfeltöltés: ${progress}%`);
    });
  } catch (error) {
    result = { success: false, error: error.message || "A termékkép feltöltése sikertelen." };
  } finally {
    progressContainer?.classList.add("d-none");
    button.disabled = false;
    if (saveButton) saveButton.disabled = false;
    input.disabled = false;
    button.innerHTML = previousContent;
  }

  if (!result.success) {
    setProductImageStatus(form, result.error, "danger");
    return;
  }

  const imageUrl = result.data?.imageURL || result.data?.productImageURL;
  if (!imageUrl) {
    const modalElement = form.closest("#admin-edit-modal");
    if (modalElement) modalElement.dataset.refreshProductsOnClose = "true";
    if (saveButton) saveButton.disabled = true;
    setProductImageStatus(
      form,
      "A feltöltés sikerült, de az új kép URL-je nem érkezett vissza. Zárd be ezt az ablakot; a terméklista frissül, utána nyisd meg újra a szerkesztést.",
      "danger",
    );
    return;
  }

  const imageUrlInput = form.querySelector('input[name="imageURL"]');
  const preview = form.querySelector("[data-admin-product-image-preview]");
  if (preview) {
    preview.dataset.originalSrc = ResolveProductImageUrl(imageUrl);
    SetProductImageSource(preview, imageUrl, { loading: "eager" });
  }
  if (imageUrlInput) imageUrlInput.value = imageUrl;
  input.value = "";

  const product = state.items.find((item) => String(item.sku) === String(sku));
  if (product) product.imageURL = imageUrl;
  root.querySelectorAll("[data-admin-product-thumbnail]").forEach((thumbnail) => {
    if (thumbnail.dataset.adminProductThumbnail === String(sku)) {
      SetProductImageSource(thumbnail, imageUrl);
    }
  });
  setProductImageStatus(form, "A termékkép feltöltése sikerült.", "success");
}

async function toggleActive(button) {
  const identity = button.dataset.adminToggle;
  if (state.panel === "profiles" && IsProtectedAdministratorProfile(identity)) {
    showAdminNotice("danger", "A profil státusza nem módosítható", "Az Administrator profil védett rendszerprofil.");
    return;
  }
  const currentlyActive = button.dataset.adminActive === "true";
  const item = getPanelItem(identity);
  const label = item?.productName ?? item?.product?.productName ?? item?.userName ?? identity;
  const actionName = currentlyActive ? "deaktiválás" : "aktiválás";
  const confirmed = await confirmAdminAction({
    title: currentlyActive ? "Deaktiválás megerősítése" : "Aktiválás megerősítése",
    message: `Biztosan szeretnéd ${actionName} ezt az elemet?\n${label}`,
    icon: currentlyActive ? "bi-toggle-off" : "bi-toggle-on",
    confirmLabel: currentlyActive ? "Deaktiválás" : "Aktiválás",
    danger: currentlyActive,
  });
  if (!confirmed) return;

  const setters = {
    products: AdminPanelService.setProductActive,
    stocks: AdminPanelService.setStockActive,
    profiles: AdminPanelService.setProfileActive,
  };
  button.disabled = true;
  const result = await setters[state.panel](identity, !currentlyActive);
  if (!result.success) {
    button.disabled = false;
    showAdminNotice("danger", "A státusz módosítása nem sikerült", result.error);
    return;
  }
  await loadPanel();
}

function showLogDetails(identity) {
  const item = state.items.find((row) => String(row.id ?? row.logId ?? row.shopLogId) === String(identity));
  if (!item) return;
  root.querySelector("#admin-log-details-modal")?.remove();
  root.insertAdjacentHTML("beforeend", RenderAdminLogDetails(state.logType, item));
  const element = root.querySelector("#admin-log-details-modal");
  const modal = bootstrap.Modal.getOrCreateInstance(element);
  element.addEventListener("hidden.bs.modal", () => {
    modal.dispose();
    element.remove();
  }, { once: true });
  modal.show();
}

function showAdminNotice(type, title, message) {
  root.querySelector("#admin-notice-modal")?.remove();
  root.insertAdjacentHTML("beforeend", RenderAdminNoticeModal(type, title, message));
  const element = root.querySelector("#admin-notice-modal");
  const modal = bootstrap.Modal.getOrCreateInstance(element);
  element.addEventListener("hidden.bs.modal", () => {
    modal.dispose();
    element.remove();
  }, { once: true });
  modal.show();
}

export function InitializeAdminPanelFeature() {
  if (!root) return;

  root.addEventListener("click", async (event) => {
    const productImageUploadButton = event.target.closest("[data-admin-product-image-upload]");
    if (productImageUploadButton) {
      await uploadAdminProductImage(productImageUploadButton);
      return;
    }

    const deleteDocumentButton = event.target.closest("[data-stock-document-delete]");
    if (deleteDocumentButton) {
      await deleteStockDocument(deleteDocumentButton);
      return;
    }

    const uploadDocumentButton = event.target.closest("[data-stock-document-upload]");
    if (uploadDocumentButton) {
      await uploadStockDocument(uploadDocumentButton);
      return;
    }

    const openDocumentButton = event.target.closest("[data-stock-document-open]");
    if (openDocumentButton) {
      await openStockDocument(
        openDocumentButton.dataset.stockDocumentOpen,
        openDocumentButton.dataset.documentName,
      );
      return;
    }

    const downloadDocumentButton = event.target.closest("[data-stock-document-download]");
    if (downloadDocumentButton) {
      await downloadStockDocument(
        downloadDocumentButton.dataset.stockDocumentDownload,
        downloadDocumentButton.dataset.documentName,
      );
      return;
    }

    if (event.target.closest("[data-stock-document-close]")) {
      closeStockDocumentViewer();
      return;
    }

    if (event.target.closest("[data-stock-document-viewer-download]")) {
      if (activeStockDocumentBlob) {
        downloadBlob(activeStockDocumentBlob, activeStockDocumentFileName);
      }
      return;
    }

    const openPanelButton = event.target.closest("[data-open-admin-panel]");
    if (openPanelButton) {
      state.panel = openPanelButton.dataset.openAdminPanel;
      state.items = [];
      state.search = "";
      state.page = 1;
      await loadPanel();
      return;
    }

    if (event.target.closest("[data-admin-home]")) {
      loadSequence += 1;
      state.panel = null;
      state.loading = false;
      render();
      return;
    }

    if (event.target.closest("[data-admin-refresh]")) {
      const search = root.querySelector("[data-admin-search]");
      state.search = search?.value.trim() ?? state.search;
      state.from = root.querySelector("[data-log-from]")?.value ?? state.from;
      state.to = root.querySelector("[data-log-to]")?.value ?? state.to;
      state.page = 1;
      await loadPanel();
      return;
    }

    const editButton = event.target.closest("[data-admin-edit]");
    if (editButton) {
      const item = getPanelItem(editButton.dataset.adminEdit);
      if (item) showEditModal(item);
      return;
    }

    const toggleButton = event.target.closest("[data-admin-toggle]");
    if (toggleButton) {
      await toggleActive(toggleButton);
      return;
    }

    const logTypeButton = event.target.closest("[data-log-type]");
    if (logTypeButton) {
      state.logType = logTypeButton.dataset.logType;
      state.page = 1;
      await loadLogs();
      return;
    }

    const pageButton = event.target.closest("[data-log-page]");
    if (pageButton) {
      state.page += pageButton.dataset.logPage === "next" ? 1 : -1;
      await loadLogs();
      return;
    }

    const detailButton = event.target.closest("[data-log-detail]");
    if (detailButton) showLogDetails(detailButton.dataset.logDetail);
  });

  root.addEventListener("submit", async (event) => {
    const form = event.target.closest("[data-admin-edit-form]");
    if (!form) return;
    event.preventDefault();
    await saveEdit(form);
  });

  root.addEventListener("change", (event) => {
    const fileInput = event.target.closest("[data-stock-document-file]");
    if (fileInput) handleStockDocumentFileChange(fileInput);

    const productImageInput = event.target.closest("[data-admin-product-image]");
    if (productImageInput) previewProductImage(productImageInput);
  });

  root.addEventListener("keydown", async (event) => {
    if (event.key === "Escape" && root.querySelector("[data-stock-document-viewer]")) {
      closeStockDocumentViewer();
      return;
    }
    if (event.key !== "Enter" || !event.target.matches("[data-admin-search]")) return;
    event.preventDefault();
    state.search = event.target.value.trim();
    await loadPanel();
  });

  render();
}
