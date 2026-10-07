export function ShowBrandCreateModal() {
  const modalElement = document.getElementById("brand-create-modal");

  if (!modalElement) {
    return;
  }

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.show();
}

export function HideBrandCreateModal() {
  const modalElement = document.getElementById("brand-create-modal");

  if (!modalElement) {
    return;
  }

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.hide();
}

export function ShowBrandUpdateModal(brand) {
  const originalNameInput = document.getElementById(
    "update-original-brandname",
  );

  const brandNameInput = document.getElementById("update-brandname-input");

  if (!originalNameInput || !brandNameInput) {
    return;
  }

  originalNameInput.value = brand.brandName;
  brandNameInput.value = brand.brandName;

  const modalElement = document.getElementById("brand-update-modal");

  if (!modalElement) {
    return;
  }

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.show();
}

export function HideBrandUpdateModal() {
  const modalElement = document.getElementById("brand-update-modal");

  if (!modalElement) {
    return;
  }

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.hide();
}

export function GetCreateBrandName() {
  return document.getElementById("create-brandname-input")?.value ?? "";
}

export function GetUpdateBrandName() {
  return document.getElementById("update-brandname-input")?.value ?? "";
}

export function ClearCreateBrandInput() {
  const input = document.getElementById("create-brandname-input");

  if (input) {
    input.value = "";
  }
}
