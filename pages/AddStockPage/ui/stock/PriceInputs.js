export function ReturnPriceInputs() {
  return `
    <div class="mb-3 col-12 row d-flex justify-content-evenly">

      <div class="col-12 col-md-5">
        <label for="original-price-input" class="form-label">
          Normál ár (Ft)
        </label>

        <input
          type="number"
          min="0"
          class="form-control"
          id="original-price-input"
          placeholder="799"
        />
      </div>

      <div class="col-12 col-md-5">
        <label for="current-price-input" class="form-label">
          Aktuális ár (Ft)
        </label>

        <input
          type="number"
          min="0"
          class="form-control"
          id="current-price-input"
          placeholder="599"
        />
      </div>

      <div class="col-12 col-md-10 mt-3">
        <div
          class="alert alert-success d-none"
          id="discount-info"
        ></div>
      </div>

    </div>
  `;
}
