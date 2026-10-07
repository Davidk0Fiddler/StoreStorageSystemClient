export function ShowProductSizeCreateModal() {
  const modalElement = document.getElementById("ProductSize-create-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.show();
}

export function HideProductSizeCreateModal() {
  const modalElement = document.getElementById("ProductSize-create-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.hide();
}

export function ShowProductSizeUpdateModal(productSize) {
  const originalNameInput = document.getElementById(
    "update-original-ProductSize-name",
  );

  const productSizeNameInput = document.getElementById(
    "update-ProductSize-name-input",
  );

  if (!originalNameInput || !productSizeNameInput) {
    return;
  }

  originalNameInput.value = productSize.sizeName;
  productSizeNameInput.value = productSize.sizeName;

  const modalElement = document.getElementById("ProductSize-update-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.show();
}

export function HideProductSizeUpdateModal() {
  const modalElement = document.getElementById("ProductSize-update-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.hide();
}

export function GetCreateProductSizeName() {
  return document.getElementById("create-ProductSize-name-input")?.value ?? "";
}

export function GetUpdateProductSizeName() {
  return document.getElementById("update-ProductSize-name-input")?.value ?? "";
}

export function ClearCreateProductSizeInput() {
  const input = document.getElementById("create-ProductSize-name-input");

  if (input) {
    input.value = "";
  }
}
