export function CreateCartItem(selectedProduct, index) {
  const cartItem = document.createElement("div");

  cartItem.classList.add(
    "border",
    "rounded-3",
    "p-3",
    "mb-2",
    "bg-white",
    "shadow-sm",
  );

  cartItem.innerHTML = `
    <div class="d-flex justify-content-between align-items-start">

      <div class="fs-3 fw-semibold text-truncate pe-2">
        ${selectedProduct.product.productName}
      </div>

      <button
        type="button"
        class="btn btn-danger fw-bold cart-remove-btn"
        aria-label="Termék törlése"
      >
        ×
      </button>

    </div>

    <div class="small text-secondary mt-1">
      ${selectedProduct.product.afaPercent}% ÁFA
    </div>

    <div class="d-flex justify-content-between align-items-center mt-3">

      <div class="input-group input-group-sm" style="width: 130px;">

        <button
          type="button"
          class="btn btn-outline-secondary fw-bold cart-minus-btn"
        >
          −
        </button>

        <span class="form-control text-center bg-white">
          ${selectedProduct.amount}
        </span>

        <button
          type="button"
          class="btn btn-outline-secondary fw-bold cart-plus-btn"
        >
          +
        </button>

      </div>

      <div class="fw-bold fs-5 ms-3 text-nowrap">
        ${selectedProduct.amount * selectedProduct.product.unitPrice} Ft
      </div>

    </div>

    ${
      selectedProduct.product.deposit != 0
        ? `
          <div class="d-flex justify-content-between align-items-center text-secondary">

            <div style="width: 130px;">
              Betétdíj
            </div>

            <div class="ms-3 text-nowrap">
              ${selectedProduct.product.deposit * selectedProduct.amount} Ft
            </div>

          </div>
        `
        : ""
    }
  `;

  const removeButton = cartItem.querySelector(".cart-remove-btn");

  const minusButton = cartItem.querySelector(".cart-minus-btn");

  const plusButton = cartItem.querySelector(".cart-plus-btn");

  removeButton.addEventListener("click", () => {
    cartItem.dispatchEvent(
      new CustomEvent("remove-product", {
        bubbles: true,
        detail: {
          index,
        },
      }),
    );
  });

  minusButton.addEventListener("click", () => {
    cartItem.dispatchEvent(
      new CustomEvent("decrease-quantity", {
        bubbles: true,
        detail: {
          index,
        },
      }),
    );
  });

  plusButton.addEventListener("click", () => {
    cartItem.dispatchEvent(
      new CustomEvent("increase-quantity", {
        bubbles: true,
        detail: {
          index,
        },
      }),
    );
  });

  return cartItem;
}
