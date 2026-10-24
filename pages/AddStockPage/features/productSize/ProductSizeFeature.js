import {
  GetAllProductSizes,
  GetFilteredProductSizes,
  GetProductSizeStatistics,
  ChangeProductSizeFilter,
  ActivateProductSize,
  DeactivateProductSize,
  CreateProductSize,
  UpdateProductSize,
} from "./ProductSizeService.js";

import {
  GetProductSizeFilter,
  SetUpdatingProductSizeId,
  GetUpdatingProductSizeId,
} from "./ProductSizeState.js";

import { RenderProductSizePanel } from "../../ui/productSize/ProductSizePanel.js";
import { DisplayProductSizeList } from "../../ui/productSize/ProductSizeList.js";
import { DisplayProductSizeStatistics } from "../../ui/productSize/ProductSizeStatistics.js";

import {
  ShowProductSizeCreateModal,
  HideProductSizeCreateModal,
  ShowProductSizeUpdateModal,
  HideProductSizeUpdateModal,
  GetCreateProductSizeName,
  GetUpdateProductSizeName,
  ClearCreateProductSizeInput,
} from "../../ui/productSize/ProductSizeModals.js";

import { DisplayAlert } from "../../../shared/Alert.js";
import { AddEventListenerOnce } from "../../../shared/AddEventListenerOnce.js";
import { LoadingSpinner } from "../../../shared/LoadSpinner.js";

let productSizes = [];

export async function DisplayProductSizePanel() {
  const contentContainer = document.getElementById("content-container");

  const panelLabel = document.getElementById("panel-label");

  if (!contentContainer) return;

  if (panelLabel) {
    panelLabel.textContent = "Termékméret panel";
  }

  ChangeProductSizeFilter(null);

  contentContainer.innerHTML = RenderProductSizePanel();

  RegisterProductSizeEvents();

  await LoadProductSizes();
}

/*
 * Termékméretek betöltése.
 */
async function LoadProductSizes() {
  const response = await GetAllProductSizes();

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  productSizes = response.data;

  DisplayProductSizeStatistics(GetProductSizeStatistics(productSizes));

  RenderFilteredProductSizes();
}

/*
 * Aktuális filter alapján történő megjelenítés.
 */
function RenderFilteredProductSizes() {
  const filteredProductSizes = GetFilteredProductSizes(productSizes);

  DisplayProductSizeList(filteredProductSizes);
}

/*
 * Filter módosítása.
 */
function HandleProductSizeFilter(filter) {
  ChangeProductSizeFilter(filter);

  UpdateActiveProductSizeFilter();

  RenderFilteredProductSizes();
}

/*
 * Aktív filter vizuális állapotának frissítése.
 */
function UpdateActiveProductSizeFilter() {
  const allProductSizesButton = document.getElementById(
    "all-ProductSizes-button",
  );

  const activeProductSizesButton = document.getElementById(
    "all-active-ProductSizes-button",
  );

  const inactiveProductSizesButton = document.getElementById(
    "all-inactive-ProductSizes-button",
  );

  const buttons = [
    allProductSizesButton,
    activeProductSizesButton,
    inactiveProductSizesButton,
  ];

  buttons.forEach((button) => {
    button?.classList.remove("active");
  });

  const filter = GetProductSizeFilter();

  if (filter === null) {
    allProductSizesButton?.classList.add("active");
  }

  if (filter === true) {
    activeProductSizesButton?.classList.add("active");
  }

  if (filter === false) {
    inactiveProductSizesButton?.classList.add("active");
  }
}

/*
 * Termékméret aktiválása.
 */
async function HandleProductSizeActivation(productSizeId) {
  LoadingSpinner(true);

  const response = await ActivateProductSize(productSizeId);

  LoadingSpinner(false);

  if (response.success) {
    DisplayAlert("success", "Sikeres aktiválás!");

    await LoadProductSizes();

    return;
  }

  DisplayAlert("danger", response.error);
}

/*
 * Termékméret deaktiválása.
 */
async function HandleProductSizeDeactivation(productSizeId) {
  LoadingSpinner(true);

  const response = await DeactivateProductSize(productSizeId);

  LoadingSpinner(false);

  if (response.success) {
    DisplayAlert("success", "Sikeres deaktiválás!");

    await LoadProductSizes();

    return;
  }

  DisplayAlert("danger", response.error);
}

/*
 * Módosítási modal megnyitása.
 */
function HandleEditProductSize(productSizeId) {
  const productSize = productSizes.find((item) => item.id === productSizeId);

  if (!productSize) return;

  SetUpdatingProductSizeId(productSizeId);

  ShowProductSizeUpdateModal(productSize);
}

/*
 * Termékméret módosítása.
 */
async function HandleUpdateProductSize() {
  const productSizeId = GetUpdatingProductSizeId();

  if (!productSizeId) return;

  const productSizeName = GetUpdateProductSizeName();

  const response = await UpdateProductSize(productSizeId, productSizeName);

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  DisplayAlert("success", "Sikeres módosítás!");

  HideProductSizeUpdateModal();

  await LoadProductSizes();
}

/*
 * Új termékméret létrehozása.
 */
async function HandleCreateProductSize() {
  const productSizeName = GetCreateProductSizeName();

  const response = await CreateProductSize(productSizeName);

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  DisplayAlert("success", "Sikeres létrehozás!");

  HideProductSizeCreateModal();

  ClearCreateProductSizeInput();

  await LoadProductSizes();
}

/*
 * Összes esemény regisztrálása.
 */
function RegisterProductSizeEvents() {
  RegisterProductSizeFilterEvents();
  RegisterProductSizeListEvents();
  RegisterProductSizeCreateEvents();
  RegisterProductSizeUpdateEvents();
}

/*
 * Filter események.
 */
function RegisterProductSizeFilterEvents() {
  const allProductSizesButton = document.getElementById(
    "all-ProductSizes-button",
  );

  const activeProductSizesButton = document.getElementById(
    "all-active-ProductSizes-button",
  );

  const inactiveProductSizesButton = document.getElementById(
    "all-inactive-ProductSizes-button",
  );

  allProductSizesButton?.addEventListener("click", () =>
    HandleProductSizeFilter(null),
  );

  activeProductSizesButton?.addEventListener("click", () =>
    HandleProductSizeFilter(true),
  );

  inactiveProductSizesButton?.addEventListener("click", () =>
    HandleProductSizeFilter(false),
  );
}

/*
 * Termékméret kártyák eseményei.
 */
function RegisterProductSizeListEvents() {
  const container = document.getElementById("ProductSizes-container");

  if (!container) return;

  container.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;

    const productSizeId = Number(button.dataset.productSizeId);

    if (!productSizeId) return;

    switch (action) {
      case "activate-productsize":
        await HandleProductSizeActivation(productSizeId);
        break;

      case "deactivate-productsize":
        await HandleProductSizeDeactivation(productSizeId);
        break;

      case "edit-productsize":
        HandleEditProductSize(productSizeId);
        break;
    }
  });
}

/*
 * Létrehozás eseményei.
 */
function RegisterProductSizeCreateEvents() {
  const openButton = document.getElementById(
    "open-ProductSize-creation-modal-button",
  );

  openButton?.addEventListener("click", ShowProductSizeCreateModal);

  const saveButton = document.getElementById("ProductSize-create-save-button");

  AddEventListenerOnce(
    saveButton,
    "click",
    HandleCreateProductSize,
    "create-product-size",
  );
}

/*
 * Módosítás eseménye.
 */
function RegisterProductSizeUpdateEvents() {
  const saveButton = document.getElementById("ProductSize-update-save-button");

  AddEventListenerOnce(
    saveButton,
    "click",
    HandleUpdateProductSize,
    "update-product-size",
  );
}
