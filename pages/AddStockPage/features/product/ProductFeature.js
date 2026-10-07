import {
  GetAllProducts,
  GetFilteredProducts,
  ActivateProduct,
  DeactivateProduct,
  GetProductBySKU,
  CreateProduct,
  UpdateProduct,
} from "./ProductService.js";

import {
  SetProductSearchFilter,
  SetProductSearchValue,
  ClearProductSearch,
  SetCurrentlyUpdatingProductSKU,
  GetCurrentlyUpdatingProductSKU,
} from "./ProductState.js";

import { GetAllBrands } from "../brand/BrandService.js";
import { GetAllProductTypes } from "../productType/productTypeService.js";
import { GetAllProductSizes } from "../productSize/ProductSizeService.js";

import { RenderProductPanel } from "../../ui/product/ProductPanel.js";
import { DisplayProductList } from "../../ui/product/ProductList.js";

import {
  ShowProductCreateModal,
  HideProductCreateModal,
  ShowProductUpdateModal,
  ShowProductDetailedModal,
  SetProductDetailedData,
  SetProductUpdateData,
  GetProductCreateName,
  GetProductCreateBarcode,
  GetProductCreateSKU,
  GetProductCreateProductType,
  GetProductCreateProductSize,
  GetProductCreateBrand,
  GetProductCreateImage,
  GetProductCreateHasDeposit,
  GetProductCreateDepositAmount,
  GetProductUpdateName,
  GetProductUpdateBarcode,
  GetProductUpdateProductType,
  GetProductUpdateProductSize,
  GetProductUpdateBrand,
  GetProductUpdateHasDeposit,
  GetProductUpdateDepositAmount,
  GetProductUpdateImage,
  SetProductCreateDepositAmountDisabled,
  SetProductUpdateDepositAmountDisabled,
  ClearProductCreateInputs,
} from "../../ui/product/ProductModals.js";

import {
  GetProductSearchFilter as GetSearchFilterInput,
  GetProductSearchValue as GetSearchValueInput,
  UpdateProductSearchFilterLabel,
  ShowProductSearchFilter,
  HideProductSearchFilter,
  ClearProductSearchInput,
  CloseProductSearchModal,
} from "../../ui/product/ProductSearch.js";

import { DisplayAlert } from "../../../shared/Alert.js";
import { LoadingSpinner } from "../../../shared/LoadSpinner.js";

export async function DisplayProductPanel() {
  const contentContainer = document.getElementById("content-container");

  const panelLabel = document.getElementById("panel-label");

  if (!contentContainer) return;

  if (panelLabel) {
    panelLabel.textContent = "Termék panel";
  }

  ClearProductSearch();

  contentContainer.innerHTML = RenderProductPanel();

  RegisterProductEvents();

  await LoadProducts();
}

async function LoadProducts() {
  LoadingSpinner(true);

  const response = await GetAllProducts();

  LoadingSpinner(false);

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  RenderProducts();
}

function RenderProducts() {
  const products = GetFilteredProducts();

  DisplayProductList(products);
}

/*
 * PRODUCT SEARCH
 */

function HandleProductSearch() {
  const filter = GetSearchFilterInput();
  const value = GetSearchValueInput().trim().toLowerCase();

  if (!filter) {
    DisplayAlert("warning", "Válasszon keresési szempontot!");
    return;
  }

  if (!value) {
    DisplayAlert("warning", "Adjon meg keresési értéket!");
    return;
  }

  SetProductSearchFilter(filter);
  SetProductSearchValue(value);

  ShowProductSearchFilter();

  RenderProducts();

  CloseProductSearchModal();
}

function HandleDismissProductSearch() {
  ClearProductSearch();

  ClearProductSearchInput();
  HideProductSearchFilter();

  RenderProducts();
}

function HandleProductSearchFilterChange(event) {
  const filter = event.target.value;

  const labels = {
    nev: "Terméknév",
    vonalkod: "Vonalkód",
    sku: "SKU",
    termektipus: "Terméktípus",
    termekmeret: "Termékméret",
    marka: "Márka",
  };

  UpdateProductSearchFilterLabel(labels[filter] ?? "Keresési érték");
}

/*
 * PRODUCT ACTIVATION
 */

async function HandleProductActivation(productSKU) {
  LoadingSpinner(true);

  const response = await ActivateProduct(productSKU);

  LoadingSpinner(false);

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  DisplayAlert("success", "Sikeres aktiválás!");

  await LoadProducts();
}

async function HandleProductDeactivation(productSKU) {
  LoadingSpinner(true);

  const response = await DeactivateProduct(productSKU);

  LoadingSpinner(false);

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  DisplayAlert("success", "Sikeres deaktiválás!");

  await LoadProducts();
}

/*
 * PRODUCT DETAILS
 */

async function HandleViewProduct(productSKU) {
  LoadingSpinner(true);

  const response = await GetProductBySKU(productSKU);

  LoadingSpinner(false);

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  SetProductDetailedData(response.data);
  ShowProductDetailedModal();
}

/*
 * PRODUCT UPDATE
 */

async function HandleEditProduct(productSKU) {
  LoadingSpinner(true);

  const response = await GetProductBySKU(productSKU);

  LoadingSpinner(false);

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  SetCurrentlyUpdatingProductSKU(productSKU);

  await LoadProductUpdateSelects(response.data);

  SetProductUpdateData(response.data);

  ShowProductUpdateModal();
}
async function LoadProductUpdateSelects(product) {
  const [brandsResponse, productTypesResponse, productSizesResponse] =
    await Promise.all([
      GetAllBrands(),
      GetAllProductTypes(),
      GetAllProductSizes(),
    ]);

  if (!brandsResponse.success) {
    DisplayAlert("danger", brandsResponse.error);
    return false;
  }

  if (!productTypesResponse.success) {
    DisplayAlert("danger", productTypesResponse.error);
    return false;
  }

  if (!productSizesResponse.success) {
    DisplayAlert("danger", productSizesResponse.error);
    return false;
  }

  const activeBrands = brandsResponse.data.filter((brand) => brand.isActive);

  const activeProductTypes = productTypesResponse.data.filter(
    (productType) => productType.isActive,
  );

  const activeProductSizes = productSizesResponse.data.filter(
    (productSize) => productSize.isActive,
  );

  const currentBrand = activeBrands.find(
    (brand) => brand.brandName === product.brand,
  );

  const currentProductType = activeProductTypes.find(
    (productType) => productType.typeName === product.productType,
  );

  const currentProductSize = activeProductSizes.find(
    (productSize) => productSize.sizeName === product.productSize,
  );

  FillProductUpdateSelect(
    "product-update-brand-select",
    activeBrands,
    currentBrand?.id,
    "brandName",
  );

  FillProductUpdateSelect(
    "product-update-producttype-select",
    activeProductTypes,
    currentProductType?.id,
    "typeName",
  );

  FillProductUpdateSelect(
    "product-update-productsize-select",
    activeProductSizes,
    currentProductSize?.id,
    "sizeName",
  );

  return true;
}

function FillProductUpdateSelect(selectId, items, selectedId, nameProperty) {
  const select = document.getElementById(selectId);

  if (!select) return;

  select.innerHTML = "";

  items.forEach((item) => {
    const option = document.createElement("option");

    option.value = item.id;
    option.textContent = item[nameProperty];

    if (item.id === selectedId) {
      option.selected = true;
    }

    select.appendChild(option);
  });
}

async function HandleUpdateProduct() {
  const productSKU = GetCurrentlyUpdatingProductSKU();

  if (!productSKU) return;

  const formData = new FormData();

  const name = GetProductUpdateName().trim();

  const barcode = GetProductUpdateBarcode().trim();

  const productType = GetProductUpdateProductType();

  const productSize = GetProductUpdateProductSize();

  const brand = GetProductUpdateBrand();

  const hasDeposit = GetProductUpdateHasDeposit();

  const depositAmount = GetProductUpdateDepositAmount();

  const image = GetProductUpdateImage();

  formData.append("ProductName", name);
  formData.append("Barcode", barcode);
  formData.append("SKU", productSKU);
  formData.append("ProductTypeId", productType);
  formData.append("ProductSizeId", productSize);
  formData.append("BrandId", brand);
  formData.append("HasDeposit", hasDeposit);

  if (hasDeposit) {
    formData.append("DepositAmount", depositAmount);
  }

  if (image) {
    formData.append("Image", image);
  }

  LoadingSpinner(true);

  const response = await UpdateProduct(formData, productSKU);

  LoadingSpinner(false);

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  const modalElement = document.getElementById("product-update-modal");

  if (modalElement) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    modal.hide();
  }

  DisplayAlert("success", "Sikeres módosítás!");

  await LoadProducts();
}

/*
 * PRODUCT CREATE
 */

async function HandleOpenProductCreateModal() {
  await LoadProductCreateSelects();

  ShowProductCreateModal();
}

async function LoadProductCreateSelects() {
  const [brandsResponse, productTypesResponse, productSizesResponse] =
    await Promise.all([
      GetAllBrands(),
      GetAllProductTypes(),
      GetAllProductSizes(),
    ]);

  if (!brandsResponse.success) {
    DisplayAlert("danger", brandsResponse.error);
    return false;
  }

  if (!productTypesResponse.success) {
    DisplayAlert("danger", productTypesResponse.error);
    return false;
  }

  if (!productSizesResponse.success) {
    DisplayAlert("danger", productSizesResponse.error);
    return false;
  }

  FillProductCreateSelect(
    "product-create-brand-select",
    brandsResponse.data.filter((brand) => brand.isActive),
    "brandName",
  );

  FillProductCreateSelect(
    "product-create-producttype-select",
    productTypesResponse.data.filter((productType) => productType.isActive),
    "typeName",
  );

  FillProductCreateSelect(
    "product-create-productsize-select",
    productSizesResponse.data.filter((productSize) => productSize.isActive),
    "sizeName",
  );

  return true;
}

function FillProductCreateSelect(elementId, items, nameProperty) {
  const select = document.getElementById(elementId);

  if (!select) return;

  select.innerHTML = "";

  items.forEach((item) => {
    const option = document.createElement("option");

    option.value = item.id;
    option.textContent = item[nameProperty];

    select.appendChild(option);
  });
}

async function HandleCreateProduct() {
  const formData = new FormData();

  const name = GetProductCreateName().trim();

  const barcode = GetProductCreateBarcode().trim();

  const sku = GetProductCreateSKU().trim();

  const productType = GetProductCreateProductType();

  const productSize = GetProductCreateProductSize();

  const brand = GetProductCreateBrand();

  const image = GetProductCreateImage();

  const hasDeposit = GetProductCreateHasDeposit();

  const depositAmount = GetProductCreateDepositAmount();

  formData.append("ProductName", name);
  formData.append("Barcode", barcode);
  formData.append("SKU", sku);
  formData.append("ProductTypeId", productType);
  formData.append("ProductSizeId", productSize);
  formData.append("BrandId", brand);
  formData.append("HasDeposit", hasDeposit);

  if (hasDeposit) {
    formData.append("DepositAmount", depositAmount);
  }

  if (image) {
    formData.append("Image", image);
  }

  LoadingSpinner(true);

  const response = await CreateProduct(formData);

  LoadingSpinner(false);

  if (!response.success) {
    DisplayAlert("danger", response.error);
    return;
  }

  const modalElement = document.getElementById("product-create-modal");

  if (modalElement) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    modal.hide();
  }

  ClearProductCreateInputs();

  DisplayAlert("success", "Sikeres létrehozás!");

  await LoadProducts();
}

/*
 * EVENTS
 */

function RegisterProductEvents() {
  RegisterProductListEvents();
  RegisterProductSearchEvents();
  RegisterProductCreateEvents();
  RegisterProductUpdateEvents();
}

function RegisterProductListEvents() {
  const container = document.getElementById("products-table-body");

  if (!container) return;

  container.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;

    switch (action) {
      case "view-product": {
        const productSKU = button.dataset.productSku;

        if (!productSKU) return;

        await HandleViewProduct(productSKU);
        break;
      }

      case "edit-product": {
        const productSKU = button.dataset.productSku;

        if (!productSKU) return;

        await HandleEditProduct(productSKU);
        break;
      }

      case "activate-product": {
        const productSKU = button.dataset.productSku;

        if (!productSKU) return;

        await HandleProductActivation(productSKU);
        break;
      }

      case "deactivate-product": {
        const productSKU = button.dataset.productSku;

        if (!productSKU) return;

        await HandleProductDeactivation(productSKU);
        break;
      }
    }
  });
}

function RegisterProductSearchEvents() {
  const searchButton = document.getElementById("product-search-button");

  searchButton?.addEventListener("click", HandleProductSearch);

  const dismissButton = document.getElementById("dismiss-search-filter-button");

  dismissButton?.addEventListener("click", HandleDismissProductSearch);

  const filterSelect = document.getElementById("product-search-filter-select");

  filterSelect?.addEventListener("change", HandleProductSearchFilterChange);
}

function RegisterProductCreateEvents() {
  const openButton = document.getElementById(
    "open-product-creation-modal-button",
  );

  openButton?.addEventListener("click", HandleOpenProductCreateModal);

  const saveButton = document.getElementById("product-create-save-button");

  saveButton?.addEventListener("click", HandleCreateProduct);

  const hasDepositInput = document.getElementById(
    "product-create-hasdeposit-input",
  );

  hasDepositInput?.addEventListener("change", () => {
    SetProductCreateDepositAmountDisabled(!hasDepositInput.checked);
  });
}

function RegisterProductUpdateEvents() {
  const saveButton = document.getElementById("product-update-save-button");

  saveButton?.addEventListener("click", HandleUpdateProduct);

  const hasDepositInput = document.getElementById(
    "product-update-hasdeposit-input",
  );

  hasDepositInput?.addEventListener("change", () => {
    SetProductUpdateDepositAmountDisabled(!hasDepositInput.checked);
  });
}
