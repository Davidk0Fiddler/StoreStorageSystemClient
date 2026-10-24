import {
  GetAllBrands,
  GetFilteredBrands,
  GetBrandStatistics,
  ChangeBrandFilter,
  ActivateBrand,
  DeactivateBrand,
  CreateBrand,
  UpdateBrand,
} from "./BrandService.js";

import {
  GetBrandFilter,
  SetUpdatingBrandId,
  GetUpdatingBrandId,
} from "./BrandState.js";

import { RenderBrandPanel } from "../../ui/brand/BrandPanel.js";

import { DisplayBrandList } from "../../ui/brand/BrandList.js";

import { DisplayBrandStatistics } from "../../ui/brand/BrandStatistics.js";

import {
  ShowBrandCreateModal,
  HideBrandCreateModal,
  ShowBrandUpdateModal,
  HideBrandUpdateModal,
  GetCreateBrandName,
  GetUpdateBrandName,
  ClearCreateBrandInput,
} from "../../UI/brand/BrandModals.js";

import { DisplayAlert } from "../../../shared/Alert.js";
import { AddEventListenerOnce } from "../../../shared/AddEventListenerOnce.js";

import { LoadingSpinner } from "../../../shared/LoadSpinner.js";

let brands = [];

/*
 * ============================================================
 * PANEL
 * ============================================================
 */

export async function DisplayBrandPanel() {
  const contentContainer = document.getElementById("content-container");

  const panelLabel = document.getElementById("panel-label");

  if (!contentContainer) {
    return;
  }

  if (panelLabel) {
    panelLabel.textContent = "Márka panel";
  }

  ChangeBrandFilter(null);

  contentContainer.innerHTML = RenderBrandPanel();

  RegisterBrandEvents();

  await LoadBrands();
}

/*
 * ============================================================
 * LOAD
 * ============================================================
 */

async function LoadBrands() {
  const response = await GetAllBrands();

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  brands = response.data;

  DisplayBrandStatistics(GetBrandStatistics(brands));

  RenderFilteredBrands();
}

function RenderFilteredBrands() {
  const filteredBrands = GetFilteredBrands(brands);

  DisplayBrandList(filteredBrands);
}

/*
 * ============================================================
 * FILTER
 * ============================================================
 */

function HandleBrandFilter(filter) {
  ChangeBrandFilter(filter);

  UpdateActiveFilterButton();

  RenderFilteredBrands();
}
function UpdateActiveFilterButton() {
  const allBrandsButton = document.getElementById("all-brands-button");

  const activeBrandsButton = document.getElementById(
    "all-active-brands-button",
  );

  const inactiveBrandsButton = document.getElementById(
    "all-inactive-brands-button",
  );

  const buttons = [allBrandsButton, activeBrandsButton, inactiveBrandsButton];

  buttons.forEach((button) => {
    button?.classList.remove("active");
  });

  const filter = GetBrandFilter();

  if (filter === null) {
    allBrandsButton?.classList.add("active");
  }

  if (filter === true) {
    activeBrandsButton?.classList.add("active");
  }

  if (filter === false) {
    inactiveBrandsButton?.classList.add("active");
  }
}

/*
 * ============================================================
 * ACTIVATION / DEACTIVATION
 * ============================================================
 */

async function HandleBrandActivation(brandId) {
  LoadingSpinner(true);

  const response = await ActivateBrand(brandId);

  LoadingSpinner(false);

  if (response.success) {
    DisplayAlert("success", "Sikeres aktiválás!");

    await LoadBrands();

    return;
  }

  DisplayAlert("danger", response.error);
}

async function HandleBrandDeactivation(brandId) {
  LoadingSpinner(true);

  const response = await DeactivateBrand(brandId);

  LoadingSpinner(false);

  if (response.success) {
    DisplayAlert("success", "Sikeres deaktiválás!");

    await LoadBrands();

    return;
  }

  DisplayAlert("danger", response.error);
}

/*
 * ============================================================
 * UPDATE
 * ============================================================
 */

function HandleEditBrand(brandId) {
  const brand = brands.find((item) => item.id === brandId);

  if (!brand) {
    return;
  }

  SetUpdatingBrandId(brandId);

  ShowBrandUpdateModal(brand);
}

async function HandleUpdateBrand() {
  const brandId = GetUpdatingBrandId();

  if (!brandId) {
    return;
  }

  const brandName = GetUpdateBrandName();

  const result = await UpdateBrand(brandId, brandName);

  if (!result.success) {
    DisplayAlert("danger", result.error);

    return;
  }

  DisplayAlert("success", "Sikeres módosítás!");

  HideBrandUpdateModal();

  await LoadBrands();
}

/*
 * ============================================================
 * CREATE
 * ============================================================
 */

async function HandleCreateBrand() {
  const brandName = GetCreateBrandName();

  const result = await CreateBrand(brandName);

  if (!result.success) {
    DisplayAlert("danger", result.error);

    return;
  }

  DisplayAlert("success", "Sikeres létrehozás!");

  HideBrandCreateModal();

  ClearCreateBrandInput();

  await LoadBrands();
}

/*
 * ============================================================
 * EVENTS
 * ============================================================
 */

function RegisterBrandEvents() {
  RegisterFilterEvents();

  RegisterBrandListEvents();

  RegisterCreateBrandEvents();

  RegisterUpdateBrandEvents();
}

/*
 * ------------------------------------------------------------
 * FILTER EVENTS
 * ------------------------------------------------------------
 */

function RegisterFilterEvents() {
  const allBrandsButton = document.getElementById("all-brands-button");

  const activeBrandsButton = document.getElementById(
    "all-active-brands-button",
  );

  const inactiveBrandsButton = document.getElementById(
    "all-inactive-brands-button",
  );

  allBrandsButton?.addEventListener("click", () => {
    HandleBrandFilter(null);
  });

  activeBrandsButton?.addEventListener("click", () => {
    HandleBrandFilter(true);
  });

  inactiveBrandsButton?.addEventListener("click", () => {
    HandleBrandFilter(false);
  });
}

/*
 * ------------------------------------------------------------
 * BRAND LIST EVENTS
 * ------------------------------------------------------------
 */

function RegisterBrandListEvents() {
  const container = document.getElementById("brands-container");

  if (!container) {
    return;
  }

  container.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    const action = button.dataset.action;

    const brandId = Number(button.dataset.brandId);

    if (!brandId) {
      return;
    }

    switch (action) {
      case "activate-brand":
        await HandleBrandActivation(brandId);
        break;

      case "deactivate-brand":
        await HandleBrandDeactivation(brandId);
        break;

      case "edit-brand":
        HandleEditBrand(brandId);
        break;
    }
  });
}

/*
 * ------------------------------------------------------------
 * CREATE EVENTS
 * ------------------------------------------------------------
 */

function RegisterCreateBrandEvents() {
  const openButton = document.getElementById(
    "open-brand-creation-modal-button",
  );

  openButton?.addEventListener("click", ShowBrandCreateModal);

  const saveButton = document.getElementById("brand-create-save-button");

  AddEventListenerOnce(saveButton, "click", HandleCreateBrand, "create-brand");
}

/*
 * ------------------------------------------------------------
 * UPDATE EVENTS
 * ------------------------------------------------------------
 */

function RegisterUpdateBrandEvents() {
  const saveButton = document.getElementById("brand-update-save-button");

  AddEventListenerOnce(saveButton, "click", HandleUpdateBrand, "update-brand");
}
