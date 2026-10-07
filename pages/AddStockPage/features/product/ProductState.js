let loadedProducts = [];
let currentlyUpdatingProductSKU = null;

let currentProductSearchFilter = null;
let currentProductSearchValue = "";

export function GetLoadedProducts() {
  return loadedProducts;
}

export function SetLoadedProducts(products) {
  loadedProducts = products;
}

export function GetCurrentlyUpdatingProductSKU() {
  return currentlyUpdatingProductSKU;
}

export function SetCurrentlyUpdatingProductSKU(sku) {
  currentlyUpdatingProductSKU = sku;
}

export function GetProductSearchFilter() {
  return currentProductSearchFilter;
}

export function SetProductSearchFilter(filter) {
  currentProductSearchFilter = filter;
}

export function GetProductSearchValue() {
  return currentProductSearchValue;
}

export function SetProductSearchValue(value) {
  currentProductSearchValue = value;
}

export function ClearProductSearch() {
  currentProductSearchFilter = null;
  currentProductSearchValue = "";
}
