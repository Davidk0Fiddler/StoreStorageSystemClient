export function GetCartList() {
  return document.getElementById("cashier-cart-list");
}

export function GetCartItemCountArea() {
  return document.getElementById("cart-item-count");
}

export function GetCartTotalArea() {
  return document.getElementById("cart-total");
}

export function GetEmptyCartArea() {
  return document.getElementById("empty-cart");
}

export function ClearCartList() {
  const cartList = GetCartList();

  if (!cartList) {
    return;
  }

  cartList.innerHTML = "";
}
