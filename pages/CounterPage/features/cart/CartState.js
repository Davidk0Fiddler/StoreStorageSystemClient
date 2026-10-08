let selectedProducts = [];

export function GetSelectedProducts() {
  return selectedProducts;
}

export function SetSelectedProducts(products) {
  selectedProducts = products;
}

export function AddSelectedProduct(product) {
  selectedProducts.push(product);
}

export function RemoveSelectedProduct(index) {
  selectedProducts.splice(index, 1);
}

export function ClearSelectedProducts() {
  selectedProducts = [];
}
