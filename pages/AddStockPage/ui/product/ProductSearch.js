export function GetProductSearchFilter() {
  return document.getElementById("product-search-filter-select")?.value ?? "";
}

export function GetProductSearchValue() {
  return document.getElementById("product-search-filter-input")?.value ?? "";
}

export function GetProductSearchFilterLabel() {
  return document.getElementById("product-search-filter-input-label");
}

export function SetProductSearchInputPlaceholder(placeholder) {
  const input = document.getElementById("product-search-filter-input");

  if (!input) return;

  input.placeholder = placeholder;
}

export function ClearProductSearchInput() {
  const input = document.getElementById("product-search-filter-input");

  if (input) {
    input.value = "";
  }
}

export function ShowProductSearchFilter() {
  const filter = document.getElementById("dismiss-search-filter-button");

  if (!filter) return;

  filter.classList.remove("d-none");
}

export function HideProductSearchFilter() {
  const filter = document.getElementById("dismiss-search-filter-button");

  if (!filter) return;

  filter.classList.add("d-none");
}

export function UpdateProductSearchFilterLabel(label) {
  const labelElement = GetProductSearchFilterLabel();

  if (!labelElement) return;

  labelElement.textContent = label;
}

export function CloseProductSearchModal() {
  const modalElement = document.getElementById("product-search-modal");

  if (!modalElement) return;

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.hide();
}
