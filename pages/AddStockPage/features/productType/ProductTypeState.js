let currentProductTypeFilter = null;
let updatingProductTypeId = null;

export function GetProductTypeFilter() {
  return currentProductTypeFilter;
}

export function SetProductTypeFilter(filter) {
  currentProductTypeFilter = filter;
}

export function GetUpdatingProductTypeId() {
  return updatingProductTypeId;
}

export function SetUpdatingProductTypeId(productTypeId) {
  updatingProductTypeId = Number(productTypeId);
}
