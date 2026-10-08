let products = [];
let selectedProduct = null;

export function GetProducts() {
  return products;
}

export function SetProducts(value) {
  products = value;
}

export function GetSelectedProduct() {
  return selectedProduct;
}

export function SetSelectedProduct(product) {
  selectedProduct = product;
}

export function ClearSelectedProduct() {
  selectedProduct = null;
}
