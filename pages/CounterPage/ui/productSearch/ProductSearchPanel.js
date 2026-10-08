export function OpenProductSearchPanel() {
  const modalElement = document.getElementById("select-product-modal");

  if (!modalElement) {
    return null;
  }

  const modal = new bootstrap.Modal(modalElement);

  modal.show();

  return modal;
}

export function CloseProductSearchPanel(modal) {
  if (!modal) {
    return;
  }

  modal.hide();

  document
    .querySelectorAll(".modal-backdrop")
    .forEach((backdrop) => backdrop.remove());
}

export function ShowSelectedProduct(product) {
  if (!product) {
    return;
  }

  const selectedProductImage = document.getElementById(
    "selected-product-image",
  );

  const selectedProductName = document.getElementById("selected-product-name");

  if (selectedProductImage) {
    selectedProductImage.src = product.imageURL ?? "";
  }

  if (selectedProductName) {
    selectedProductName.textContent =
      product.productName ?? "Ismeretlen termék";
  }
}

export function GetProductSearchInput() {
  return document.getElementById("product-filter-input");
}

export function GetBarcodeInput() {
  return document.getElementById("barcode-input");
}

export function GetSelectProductButton() {
  return document.getElementById("select-product-btn");
}

export function GetSearchProductCloseButton() {
  return document.getElementById("search-product-modal-close-btn");
}
