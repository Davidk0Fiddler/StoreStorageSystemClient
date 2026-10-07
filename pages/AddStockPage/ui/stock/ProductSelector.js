export function ReturnProductSelector() {
  return `
    <div class="mb-3 col-12 row mt-3 d-flex justify-content-evenly">

      <div class="col-12 col-md-5">
        <label for="barcode-input" class="form-label">
          Vonalkód
        </label>

        <input
          type="text"
          class="form-control"
          id="barcode-input"
          placeholder="5901234123457"
        />
      </div>

      <div class="col-12 col-md-5">
        <label for="stock-quantity-input" class="form-label">
          Mennyiség
        </label>

        <input
          type="number"
          min="1"
          class="form-control"
          id="stock-quantity-input"
          placeholder="20"
        />
      </div>

      <div class="col-12 col-md-10 mt-3">
        <div
          class="alert alert-secondary"
          id="selected-product-container"
        >
          <strong>Termék:</strong>

          <span id="selected-product-name">
            Nincs kiválasztott termék
          </span>
        </div>
      </div>

    </div>
  `;
}
