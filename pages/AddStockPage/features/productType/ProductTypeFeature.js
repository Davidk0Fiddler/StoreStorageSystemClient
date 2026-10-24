import {
  GetAllProductTypes,
  GetFilteredProductTypes,
  GetProductTypeStatistics,
  ChangeProductTypeFilter,
  ActivateProductType,
  DeactivateProductType,
  CreateProductType,
  UpdateProductType,
} from "./productTypeService.js";

import {
  GetProductTypeFilter,
  SetUpdatingProductTypeId,
  GetUpdatingProductTypeId,
} from "./ProductTypeState.js";

import { RenderProductTypePanel } from "../../ui/productType/ProductTypePanel.js";
import { DisplayProductTypeList } from "../../ui/productType/ProductTypeList.js";
import { DisplayProductTypeStatistics } from "../../ui/productType/ProductTypeStatistics.js";

import {
  ShowProductTypeCreateModal,
  HideProductTypeCreateModal,
  ShowProductTypeUpdateModal,
  HideProductTypeUpdateModal,
  GetCreateProductTypeName,
  GetUpdateProductTypeName,
  ClearCreateProductTypeInput,
} from "../../ui/productType/ProductTypeModals.js";

import { DisplayAlert } from "../../../shared/Alert.js";
import { AddEventListenerOnce } from "../../../shared/AddEventListenerOnce.js";
import { LoadingSpinner } from "../../../shared/LoadSpinner.js";

let productTypes = [];

export async function DisplayProductTypePanel() {
  const contentContainer = document.getElementById("content-container");

  const panelLabel = document.getElementById("panel-label");

  if (!contentContainer) return;

  if (panelLabel) {
    panelLabel.textContent = "Terméktípus panel";
  }

  ChangeProductTypeFilter(null);

  contentContainer.innerHTML = RenderProductTypePanel();

  RegisterProductTypeEvents();

  await LoadProductTypes();
}

async function LoadProductTypes() {
  const response = await GetAllProductTypes();

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  productTypes = response.data;

  DisplayProductTypeStatistics(GetProductTypeStatistics(productTypes));

  RenderFilteredProductTypes();
}

function RenderFilteredProductTypes() {
  const filteredProductTypes = GetFilteredProductTypes(productTypes);

  DisplayProductTypeList(filteredProductTypes);
}

function HandleProductTypeFilter(filter) {
  ChangeProductTypeFilter(filter);

  UpdateActiveProductTypeFilter();

  RenderFilteredProductTypes();
}

function UpdateActiveProductTypeFilter() {
  const allProductTypesButton = document.getElementById(
    "all-producttypes-button",
  );

  const activeProductTypesButton = document.getElementById(
    "all-active-producttypes-button",
  );

  const inactiveProductTypesButton = document.getElementById(
    "all-inactive-producttypes-button",
  );

  const buttons = [
    allProductTypesButton,
    activeProductTypesButton,
    inactiveProductTypesButton,
  ];

  buttons.forEach((button) => {
    button?.classList.remove("active");
  });

  const filter = GetProductTypeFilter();

  if (filter === null) {
    allProductTypesButton?.classList.add("active");
  }

  if (filter === true) {
    activeProductTypesButton?.classList.add("active");
  }

  if (filter === false) {
    inactiveProductTypesButton?.classList.add("active");
  }
}

async function HandleProductTypeActivation(productTypeId) {
  LoadingSpinner(true);

  const response = await ActivateProductType(productTypeId);

  LoadingSpinner(false);

  if (response.success) {
    DisplayAlert("success", "Sikeres aktiválás!");

    await LoadProductTypes();

    return;
  }

  DisplayAlert("danger", response.error);
}

async function HandleProductTypeDeactivation(productTypeId) {
  LoadingSpinner(true);

  const response = await DeactivateProductType(productTypeId);

  LoadingSpinner(false);

  if (response.success) {
    DisplayAlert("success", "Sikeres deaktiválás!");

    await LoadProductTypes();

    return;
  }

  DisplayAlert("danger", response.error);
}

function HandleEditProductType(productTypeId) {
  const productType = productTypes.find((item) => item.id === productTypeId);

  if (!productType) return;

  SetUpdatingProductTypeId(productTypeId);

  ShowProductTypeUpdateModal(productType);
}

async function HandleUpdateProductType() {
  const productTypeId = GetUpdatingProductTypeId();

  if (!productTypeId) return;

  const productTypeName = GetUpdateProductTypeName();

  const response = await UpdateProductType(productTypeId, productTypeName);

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  DisplayAlert("success", "Sikeres módosítás!");

  HideProductTypeUpdateModal();

  await LoadProductTypes();
}

async function HandleCreateProductType() {
  const productTypeName = GetCreateProductTypeName();

  const response = await CreateProductType(productTypeName);

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  DisplayAlert("success", "Sikeres létrehozás!");

  HideProductTypeCreateModal();

  ClearCreateProductTypeInput();

  await LoadProductTypes();
}

function RegisterProductTypeEvents() {
  RegisterProductTypeFilterEvents();
  RegisterProductTypeListEvents();
  RegisterProductTypeCreateEvents();
  RegisterProductTypeUpdateEvents();
}

function RegisterProductTypeFilterEvents() {
  const allProductTypesButton = document.getElementById(
    "all-producttypes-button",
  );

  const activeProductTypesButton = document.getElementById(
    "all-active-producttypes-button",
  );

  const inactiveProductTypesButton = document.getElementById(
    "all-inactive-producttypes-button",
  );

  allProductTypesButton?.addEventListener("click", () =>
    HandleProductTypeFilter(null),
  );

  activeProductTypesButton?.addEventListener("click", () =>
    HandleProductTypeFilter(true),
  );

  inactiveProductTypesButton?.addEventListener("click", () =>
    HandleProductTypeFilter(false),
  );
}

function RegisterProductTypeListEvents() {
  const container = document.getElementById("producttypes-container");

  if (!container) return;

  container.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;

    const productTypeId = Number(button.dataset.productTypeId);

    if (!productTypeId) return;

    switch (action) {
      case "activate-producttype":
        await HandleProductTypeActivation(productTypeId);
        break;

      case "deactivate-producttype":
        await HandleProductTypeDeactivation(productTypeId);
        break;

      case "edit-producttype":
        HandleEditProductType(productTypeId);
        break;
    }
  });
}

function RegisterProductTypeCreateEvents() {
  const openButton = document.getElementById(
    "open-producttype-creation-modal-button",
  );

  openButton?.addEventListener("click", ShowProductTypeCreateModal);

  const saveButton = document.getElementById("producttype-create-save-button");

  AddEventListenerOnce(
    saveButton,
    "click",
    HandleCreateProductType,
    "create-product-type",
  );
}

function RegisterProductTypeUpdateEvents() {
  const saveButton = document.getElementById("producttype-update-save-button");

  AddEventListenerOnce(
    saveButton,
    "click",
    HandleUpdateProductType,
    "update-product-type",
  );
}
