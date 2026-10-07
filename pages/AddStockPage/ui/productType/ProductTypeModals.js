export function ShowProductTypeCreateModal() {
  const modalElement = document.getElementById("producttype-create-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.show();
}

export function HideProductTypeCreateModal() {
  const modalElement = document.getElementById("producttype-create-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.hide();
}

export function ShowProductTypeUpdateModal(productType) {
  const originalNameInput = document.getElementById(
    "update-original-producttype-name",
  );

  const productTypeNameInput = document.getElementById(
    "update-producttype-name-input",
  );

  if (!originalNameInput || !productTypeNameInput) {
    return;
  }

  originalNameInput.value = productType.typeName;
  productTypeNameInput.value = productType.typeName;

  const modalElement = document.getElementById("producttype-update-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.show();
}

export function HideProductTypeUpdateModal() {
  const modalElement = document.getElementById("producttype-update-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.hide();
}

export function GetCreateProductTypeName() {
  return document.getElementById("create-producttype-name-input")?.value ?? "";
}

export function GetUpdateProductTypeName() {
  return document.getElementById("update-producttype-name-input")?.value ?? "";
}

export function ClearCreateProductTypeInput() {
  const input = document.getElementById("create-producttype-name-input");

  if (input) {
    input.value = "";
  }
}
