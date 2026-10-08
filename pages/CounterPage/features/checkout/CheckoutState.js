let checkoutProducts = [];
let checkoutTotal = 0;

export function GetCheckoutProducts() {
  return checkoutProducts;
}

export function SetCheckoutProducts(products) {
  checkoutProducts = products;
}

export function GetCheckoutTotal() {
  return checkoutTotal;
}

export function SetCheckoutTotal(total) {
  checkoutTotal = total;
}

export function ClearCheckout() {
  checkoutProducts = [];
  checkoutTotal = 0;
}
