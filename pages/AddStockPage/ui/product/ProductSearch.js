export function GetProductSearchFilter() {
  return document.getElementById("product-search-filter-select")?.value ?? "";
}

export function GetProductSearchValue() {
  return document.getElementById("product-search-filter-input")?.value ?? "";
}

export function UpdateProductSearchValueControl(filter, options = []) {
  const container = document.getElementById("product-search-filter-control");

  if (!container) return;

  const usesOptions = ["termektipus", "termekmeret", "marka"].includes(filter);
  const inputGroup = document.createElement("div");
  inputGroup.className = "input-group";

  const icon = document.createElement("span");
  icon.className = "input-group-text bg-body border-end-0 rounded-start-3";
  icon.innerHTML = '<i class="bi bi-search text-body-secondary"></i>';

  const control = document.createElement(usesOptions ? "select" : "input");
  control.id = "product-search-filter-input";
  control.className = usesOptions
    ? "form-select border-start-0 rounded-end-3"
    : "form-control border-start-0 rounded-end-3";

  if (usesOptions) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = options.length
      ? "Válasszon a lehetőségek közül"
      : "Nincs választható érték";
    placeholder.disabled = options.length > 0;
    placeholder.selected = true;
    control.appendChild(placeholder);

    options.forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      control.appendChild(option);
    });
  } else {
    control.type = "text";
    control.autocomplete = "off";
    control.placeholder = "Írja be a keresett értéket";
  }

  inputGroup.append(icon, control);
  container.replaceChildren(inputGroup);
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
