export function RenderCartItemCount(selectedProducts) {
  const cartItemCountArea = document.getElementById("cart-item-count");

  if (!cartItemCountArea) {
    return;
  }

  let itemCount = 0;

  selectedProducts.forEach((item) => {
    if (item.product.productSize === "db") {
      itemCount += item.amount;
    } else {
      itemCount += 1;
    }
  });

  cartItemCountArea.textContent = `${itemCount} termék`;
}

export function RenderCartTotal(selectedProducts) {
  const totalPriceArea = document.getElementById("cart-total");

  if (!totalPriceArea) {
    return;
  }

  let totalPrice = 0;

  selectedProducts.forEach((selectedProduct) => {
    totalPrice +=
      selectedProduct.product.unitPrice * selectedProduct.amount +
      selectedProduct.product.deposit * selectedProduct.amount;
  });

  totalPriceArea.textContent = `${totalPrice} Ft`;
}

export function RenderCartSummary(selectedProducts) {
  RenderCartItemCount(selectedProducts);
  RenderCartTotal(selectedProducts);
}
