let selectedProduct = null;
let chosenProductForAddStock = null;

let isAddStockByBarcodeOpen = false;

let currentVAT = 27;
let currentMargin = 30;

export function GetSelectedProduct() {
  return selectedProduct;
}

export function SetSelectedProduct(product) {
  selectedProduct = product;
}

export function GetChosenProductForAddStock() {
  return chosenProductForAddStock;
}

export function SetChosenProductForAddStock(product) {
  chosenProductForAddStock = product;
}

export function GetIsAddStockByBarcodeOpen() {
  return isAddStockByBarcodeOpen;
}

export function SetIsAddStockByBarcodeOpen(value) {
  isAddStockByBarcodeOpen = value;
}

export function GetCurrentVAT() {
  return currentVAT;
}

export function SetCurrentVAT(vat) {
  currentVAT = vat;
}

export function GetCurrentMargin() {
  return currentMargin;
}

export function SetCurrentMargin(margin) {
  currentMargin = margin;
}
