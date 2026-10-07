let currentProductSizeFilter = null;
let updatingProductSizeId = null;

export function GetProductSizeFilter() {
  return currentProductSizeFilter;
}

export function SetProductSizeFilter(filter) {
  currentProductSizeFilter = filter;
}

export function GetUpdatingProductSizeId() {
  return updatingProductSizeId;
}

export function SetUpdatingProductSizeId(productSizeId) {
  updatingProductSizeId = Number(productSizeId);
}
