let currentBrandFilter = null;
let updatingBrandId = null;

export function GetBrandFilter() {
  return currentBrandFilter;
}

export function SetBrandFilter(filter) {
  currentBrandFilter = filter;
}

export function GetUpdatingBrandId() {
  return updatingBrandId;
}

export function SetUpdatingBrandId(brandId) {
  updatingBrandId = Number(brandId);
}
