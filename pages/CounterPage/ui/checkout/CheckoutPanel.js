export function GetCheckoutModal() {
  return document.getElementById("checkout-modal");
}

export function GetCheckoutDateArea() {
  return document.getElementById("date-area");
}

export function GetReceiptItemsArea() {
  return document.getElementById("receipt-items-area");
}

export function GetProductsCountArea() {
  return document.getElementById("products-count-area");
}

export function GetTotalPriceArea() {
  return document.getElementById("total-price-area");
}

export function GetTotalPrice() {
  return document.getElementById("total-price");
}

export function GetAfa27Area() {
  return document.getElementById("afa-27-area");
}

export function GetAfa18Area() {
  return document.getElementById("afa-18-area");
}

export function GetAfa5Area() {
  return document.getElementById("afa-5-area");
}

export function GetAfa0Area() {
  return document.getElementById("afa-0-area");
}

export function ShowCheckoutModal() {
  const modalElement = GetCheckoutModal();

  if (!modalElement) {
    return null;
  }

  const modal = new bootstrap.Modal(modalElement);

  modal.show();

  return modal;
}

export function SetCheckoutDate(dateTime) {
  const dateArea = GetCheckoutDateArea();

  if (!dateArea) {
    return;
  }

  dateArea.textContent = dateTime;
}

export function ClearReceiptItems() {
  const receiptItemsArea = GetReceiptItemsArea();

  if (!receiptItemsArea) {
    return;
  }

  receiptItemsArea.innerHTML = "";
}

export function SetProductsCount(count) {
  const productsCountArea = GetProductsCountArea();

  if (!productsCountArea) {
    return;
  }

  productsCountArea.textContent = `${count}db`;
}

export function SetTotalPrice(total) {
  const totalPriceArea = GetTotalPriceArea();
  const totalPrice = GetTotalPrice();

  if (totalPriceArea) {
    totalPriceArea.textContent = `${total}Ft`;
  }

  if (totalPrice) {
    totalPrice.textContent = `${total}Ft`;
  }
}

export function GetSavePurchaseButton() {
  return document.getElementById("save-purchase-btn");
}

export function CloseCheckoutModal() {
  const modalElement = GetCheckoutModal();

  if (!modalElement) {
    return;
  }

  const modal = bootstrap.Modal.getInstance(modalElement);

  if (modal) {
    modal.hide();
  }

  modalElement.style.display = "none";

  document
    .querySelectorAll(".modal-backdrop")
    .forEach((backdrop) => backdrop.remove());
}
