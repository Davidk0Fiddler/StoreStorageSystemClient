import {
  GetSelectedProducts,
  SetSelectedProducts,
  AddSelectedProduct,
  RemoveSelectedProduct,
  ClearSelectedProducts,
} from "./CartState.js";

export function GetCartProducts() {
  return GetSelectedProducts();
}

export function AddProductToCart(product, quantity) {
  const products = GetSelectedProducts();

  const existingProduct = products.find(
    (selectedProduct) => selectedProduct.product.sku === product.sku,
  );

  if (!existingProduct) {
    AddSelectedProduct({
      amount: Number(quantity),
      product,
    });

    return;
  }

  existingProduct.amount += Number(quantity);

  SetSelectedProducts(products);
}

export function RemoveProductFromCart(index) {
  RemoveSelectedProduct(index);
}

export function ClearCart() {
  ClearSelectedProducts();
}

export function UpdateProductQuantity(index, amount) {
  const products = GetSelectedProducts();

  if (!products[index]) {
    return;
  }

  products[index].amount = Number(amount);

  SetSelectedProducts(products);
}

export function IncreaseProductQuantity(index, amount = 1) {
  const products = GetSelectedProducts();

  if (!products[index]) {
    return;
  }

  products[index].amount += Number(amount);

  SetSelectedProducts(products);
}

export function DecreaseProductQuantity(index, amount = 1) {
  const products = GetSelectedProducts();

  if (!products[index]) {
    return;
  }

  products[index].amount -= Number(amount);

  if (products[index].amount <= 0) {
    RemoveSelectedProduct(index);
    return;
  }

  SetSelectedProducts(products);
}
