export function GetCashRegisterModal() {
  return document.getElementById("cash-register-modal");
}

export function GetCashierBarcodeInput() {
  return document.getElementById("cashier-barcode-input");
}

export function AskBuyerAge() {
  const element = document.getElementById("buyer-age-confirmation-modal");
  if (!element) return Promise.resolve(null);
  const modal = bootstrap.Modal.getOrCreateInstance(element, {
    backdrop: "static",
    keyboard: false,
  });
  const minorButton = element.querySelector("[data-buyer-is-minor]");
  const adultButton = element.querySelector("[data-buyer-is-adult]");
  return new Promise((resolve) => {
    let decision = null;
    const finish = () => resolve(decision);
    minorButton.onclick = () => {
      decision = "minor";
      modal.hide();
    };
    adultButton.onclick = () => {
      decision = "adult";
      modal.hide();
    };
    element.addEventListener("hidden.bs.modal", finish, { once: true });
    modal.show();
  });
}

export function GetCashierProductList() {
  return document.getElementById("cashier-product-list");
}

export function GetCashierProductSearch() {
  return document.getElementById("cashier-product-search");
}

export function GetQuantityModal() {
  return document.getElementById("cashierQuantityModal");
}

export function GetQuantityProductName() {
  return document.getElementById("quantity-product-name");
}

export function GetQuantityInput() {
  return document.getElementById("cashier-quantity-input");
}

export function GetQuantityUnit() {
  return document.getElementById("cashier-quantity-unit");
}

export function GetQuantityCheckButton() {
  return document.getElementById("quantity-check-btn");
}

export function GetEmptyCartArea() {
  return document.getElementById("empty-cart");
}

export function ShowEmptyCart() {
  const emptyCart = GetEmptyCartArea();

  if (!emptyCart) {
    return;
  }

  emptyCart.classList.remove("d-none");
}

export function HideEmptyCart() {
  const emptyCart = GetEmptyCartArea();

  if (!emptyCart) {
    return;
  }

  emptyCart.classList.add("d-none");
}

export function ShowCashRegisterModal() {
  const modalElement = GetCashRegisterModal();

  if (!modalElement) {
    return null;
  }

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.show();

  return modal;
}

export function ShowQuantityModal() {
  const modalElement = GetQuantityModal();

  if (!modalElement) {
    return null;
  }

  const modal = new bootstrap.Modal(modalElement);

  modal.show();

  return modal;
}

export function HideQuantityModal(modal) {
  if (!modal) {
    return;
  }

  modal.hide();
}
