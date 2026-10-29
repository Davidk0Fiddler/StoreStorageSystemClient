import {
  GetCartProducts,
  AddProductToCart,
  RemoveProductFromCart,
  ClearCart,
  UpdateProductQuantity,
  IncreaseProductQuantity,
  DecreaseProductQuantity,
} from "./CartService.js";

import { CheckProductAvailability } from "../cashier/CashierService.js";
import { ResetBuyerAgeStatus } from "../cashier/CashierState.js";

import { CreateCartItem } from "../../ui/cart/CartItem.js";

import {
  GetCartList,
  ClearCartList,
  GetEmptyCartArea,
} from "../../ui/cart/CartPanel.js";

import { RenderCartSummary } from "../../ui/cart/CartSummary.js";

import { DisplayAlert } from "../../../shared/Alert.js";

function ResetBuyerAgeStatusIfCartIsEmpty() {
  if (GetCartProducts().length === 0) {
    ResetBuyerAgeStatus();
  }
}

function RenderCartEmptyState() {
  const emptyCart = GetEmptyCartArea();

  if (!emptyCart) {
    return;
  }

  const cartProducts = GetCartProducts();

  if (cartProducts.length === 0) {
    emptyCart.classList.remove("d-none");
  } else {
    emptyCart.classList.add("d-none");
  }
}

function RenderCart() {
  const cartList = GetCartList();

  if (!cartList) {
    return;
  }

  ClearCartList();

  const selectedProducts = GetCartProducts();

  selectedProducts.forEach((selectedProduct, index) => {
    const cartItem = CreateCartItem(selectedProduct, index);

    cartList.appendChild(cartItem);
  });

  RenderCartSummary(selectedProducts);

  RenderCartEmptyState();
}

function HandleRemoveProduct(event) {
  const { index } = event.detail;

  RemoveProductFromCart(index);
  ResetBuyerAgeStatusIfCartIsEmpty();

  RenderCart();
}

function HandleDecreaseQuantity(event) {
  const { index } = event.detail;

  const products = GetCartProducts();
  const selectedProduct = products[index];

  if (!selectedProduct) {
    return;
  }

  const amount = selectedProduct.product.productSize === "db" ? 1 : 0.05;

  DecreaseProductQuantity(index, amount);
  ResetBuyerAgeStatusIfCartIsEmpty();

  RenderCart();
}

function HandleIncreaseQuantity(event) {
  const { index } = event.detail;

  const products = GetCartProducts();
  const selectedProduct = products[index];

  if (!selectedProduct) {
    return;
  }

  const amount = selectedProduct.product.productSize === "db" ? 1 : 0.05;

  IncreaseProductQuantity(index, amount);

  RenderCart();
}

function InitializeCartEvents() {
  const cartList = GetCartList();

  if (!cartList) {
    return;
  }

  cartList.addEventListener("remove-product", HandleRemoveProduct);

  cartList.addEventListener("decrease-quantity", HandleDecreaseQuantity);

  cartList.addEventListener("increase-quantity", HandleIncreaseQuantity);
}

export function InitializeCart() {
  InitializeCartEvents();
  RenderCart();
}

export function GetCart() {
  return GetCartProducts();
}

export async function AddToCart(product, quantity) {
  if (!product) {
    return false;
  }

  const numericQuantity = Number(quantity);

  if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
    DisplayAlert("danger", "Érvénytelen mennyiség.");

    return false;
  }

  const response = await CheckProductAvailability(product.sku, numericQuantity);

  if (!response.success) {
    DisplayAlert("danger", response.error);

    return false;
  }

  const availability = response.data;

  if (availability?.isAvailable === false) {
    DisplayAlert("danger", "Nincs elegendő termék az üzletben!");

    return false;
  }

  AddProductToCart(
    {
      productName: product.productName,

      productType: product.productType ?? product.productTypeName ?? product.type ?? "",

      unitPrice: availability.unitPrice,

      sku: product.sku,

      afaPercent: availability.afaPercent,

      deposit: availability.deposit,

      productSize: product.productSize,
    },
    numericQuantity,
  );

  RenderCart();

  return true;
}

export function RemoveFromCart(index) {
  RemoveProductFromCart(index);
  ResetBuyerAgeStatusIfCartIsEmpty();

  RenderCart();
}

export function ClearSelectedProducts() {
  ClearCart();
  ResetBuyerAgeStatusIfCartIsEmpty();

  RenderCart();
}

export function SetProductQuantity(index, quantity) {
  UpdateProductQuantity(index, quantity);

  RenderCart();
}

export function IncreaseQuantity(index, amount = 1) {
  IncreaseProductQuantity(index, amount);

  RenderCart();
}

export function DecreaseQuantity(index, amount = 1) {
  DecreaseProductQuantity(index, amount);
  ResetBuyerAgeStatusIfCartIsEmpty();

  RenderCart();
}
