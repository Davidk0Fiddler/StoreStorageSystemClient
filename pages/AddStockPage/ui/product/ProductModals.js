export function ShowProductCreateModal() {
  const modalElement = document.getElementById("product-create-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
}

export function HideProductCreateModal() {
  const modalElement = document.getElementById("product-create-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.hide();
}

export function ShowProductUpdateModal() {
  const modalElement = document.getElementById("product-update-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
}

export function HideProductUpdateModal() {
  const modalElement = document.getElementById("product-update-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.hide();
}

export function ShowProductDetailedModal() {
  const modalElement = document.getElementById("product-view-detailed-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
}

export function HideProductDetailedModal() {
  const modalElement = document.getElementById("product-view-detailed-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.hide();
}

/*
 * CREATE
 */

export function GetProductCreateName() {
  return document.getElementById("product-create-name-input")?.value ?? "";
}

export function GetProductCreateBarcode() {
  return document.getElementById("product-create-barcode-input")?.value ?? "";
}

export function GetProductCreateSKU() {
  return document.getElementById("product-create-sku-input")?.value ?? "";
}

export function GetProductCreateProductType() {
  return (
    document.getElementById("product-create-producttype-select")?.value ?? ""
  );
}

export function GetProductCreateProductSize() {
  return (
    document.getElementById("product-create-productsize-select")?.value ?? ""
  );
}

export function GetProductCreateBrand() {
  return document.getElementById("product-create-brand-select")?.value ?? "";
}

export function GetProductCreateImage() {
  return (
    document.getElementById("product-create-image-input")?.files?.[0] ?? null
  );
}

export function GetProductCreateHasDeposit() {
  return (
    document.getElementById("product-create-hasdeposit-input")?.checked ?? false
  );
}

export function GetProductCreateDepositAmount() {
  return (
    document.getElementById("product-create-depositamount-input")?.value ?? ""
  );
}

export function SetProductCreateDepositAmountDisabled(isDisabled) {
  const input = document.getElementById("product-create-depositamount-input");

  if (!input) return;

  input.disabled = isDisabled;
}

/*
 * DETAIL
 */

export function SetProductDetailedData(product) {
  const nameElement = document.getElementById("product-view-name");
  const barcodeElement = document.getElementById("product-view-barcode");
  const skuElement = document.getElementById("product-view-sku");
  const productTypeElement = document.getElementById(
    "product-view-producttype",
  );
  const productSizeElement = document.getElementById(
    "product-view-productsize",
  );
  const brandElement = document.getElementById("product-view-brand");
  const imageElement = document.getElementById("product-view-image");
  const hasDepositElement = document.getElementById("product-view-hasdeposit");
  const depositAmountElement = document.getElementById(
    "product-view-depositamount",
  );

  if (nameElement) nameElement.textContent = product.productName ?? "";
  if (barcodeElement) barcodeElement.textContent = product.barcode ?? "";
  if (skuElement) skuElement.textContent = product.sku ?? "";
  if (productTypeElement)
    productTypeElement.textContent = product.productType ?? "";
  if (productSizeElement)
    productSizeElement.textContent = product.productSize ?? "";
  if (brandElement) brandElement.textContent = product.brand ?? "";

  if (imageElement) {
    imageElement.src = product.imageURL ?? "";
    imageElement.alt = product.productName ?? "Termékkép";
  }

  if (hasDepositElement) {
    hasDepositElement.textContent = product.hasDeposit ? "Igen" : "Nem";
  }

  if (depositAmountElement) {
    depositAmountElement.textContent = product.hasDeposit
      ? `${product.depositAmount ?? 0} Ft`
      : "-";
  }
}

/*
 * UPDATE
 */

export function SetProductUpdateData(product) {
  const nameInput = document.getElementById("product-update-name-input");
  const barcodeInput = document.getElementById("product-update-barcode-input");
  const skuDisplay = document.getElementById("product-update-sku-display");
  const hasDepositInput = document.getElementById(
    "product-update-hasdeposit-input",
  );
  const depositAmountInput = document.getElementById(
    "product-update-depositamount-input",
  );

  if (nameInput) {
    nameInput.value = product.productName ?? "";
  }

  if (barcodeInput) {
    barcodeInput.value = product.barcode ?? "";
  }

  if (skuDisplay) {
    skuDisplay.textContent = product.sku ?? "";
  }

  if (hasDepositInput) {
    hasDepositInput.checked = product.hasDeposit ?? false;
  }

  if (depositAmountInput) {
    depositAmountInput.value = product.depositAmount ?? "";
    depositAmountInput.disabled = !product.hasDeposit;
  }
}

export function GetProductUpdateName() {
  return document.getElementById("product-update-name-input")?.value ?? "";
}

export function GetProductUpdateBarcode() {
  return document.getElementById("product-update-barcode-input")?.value ?? "";
}

export function GetProductUpdateProductType() {
  return (
    document.getElementById("product-update-producttype-select")?.value ?? ""
  );
}

export function GetProductUpdateProductSize() {
  return (
    document.getElementById("product-update-productsize-select")?.value ?? ""
  );
}

export function GetProductUpdateBrand() {
  return document.getElementById("product-update-brand-select")?.value ?? "";
}

export function GetProductUpdateHasDeposit() {
  return (
    document.getElementById("product-update-hasdeposit-input")?.checked ?? false
  );
}

export function GetProductUpdateDepositAmount() {
  return (
    document.getElementById("product-update-depositamount-input")?.value ?? ""
  );
}

export function GetProductUpdateImage() {
  return (
    document.getElementById("product-update-image-input")?.files?.[0] ?? null
  );
}

export function SetProductUpdateDepositAmountDisabled(isDisabled) {
  const input = document.getElementById("product-update-depositamount-input");

  if (!input) return;

  input.disabled = isDisabled;
}

/*
 * INPUTOK TÖRLÉSE
 */

export function ClearProductCreateInputs() {
  const ids = [
    "product-create-name-input",
    "product-create-barcode-input",
    "product-create-sku-input",
    "product-create-image-input",
    "product-create-depositamount-input",
  ];

  ids.forEach((id) => {
    const element = document.getElementById(id);

    if (!element) return;

    element.value = "";
  });

  const hasDepositInput = document.getElementById(
    "product-create-hasdeposit-input",
  );

  if (hasDepositInput) {
    hasDepositInput.checked = false;
  }
}
