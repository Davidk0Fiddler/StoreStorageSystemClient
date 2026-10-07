export function RenderStockPriceCalculator() {
  return `
    <div class="row g-4">

      <!-- Beszerzési ár -->
      <div class="col-md-6">
        <label
          for="addstock-import-price"
          class="form-label fw-semibold"
        >
          Beszerzési ár
        </label>

        <div class="input-group input-group-lg">
          <input
            type="number"
            id="addstock-import-price"
            class="form-control"
            min="0"
            step="1"
            required
          />

          <span class="input-group-text">
            Ft
          </span>
        </div>
      </div>

      <!-- Eladási ár -->
      <div class="col-md-6">
        <label
          for="addstock-current-price"
          class="form-label fw-semibold"
        >
          Eladási ár
        </label>

        <div class="input-group input-group-lg">
          <input
            type="number"
            id="addstock-current-price"
            class="form-control"
            min="0"
            step="1"
            required
          />

          <span class="input-group-text">
            Ft
          </span>
        </div>
      </div>

      <!-- Árrés -->
      <div class="col-md-6">

        <label
          class="form-label fw-semibold"
        >
          Árrés
        </label>

        <div class="input-group mb-2">
          <input
            type="number"
            id="addstock-margin-input"
            class="form-control"
            min="0"
            step="0.01"
          />

          <span class="input-group-text">
            %
          </span>
        </div>

        <div class="d-flex gap-2 flex-wrap">

          <button
            type="button"
            class="btn btn-outline-secondary"
            id="price-margin-30-btn"
            data-margin="30"
          >
            30%
          </button>

          <button
            type="button"
            class="btn btn-outline-secondary"
            id="price-margin-20-btn"
            data-margin="20"
          >
            20%
          </button>

          <button
            type="button"
            class="btn btn-outline-secondary"
            id="price-margin-10-btn"
            data-margin="10"
          >
            10%
          </button>

        </div>

      </div>

      <!-- ÁFA -->
      <div class="col-md-6">

        <label
          class="form-label fw-semibold"
        >
          ÁFA
        </label>

        <input
          type="hidden"
          id="addstock-vat"
          value="27"
        />

        <div class="d-flex gap-2 flex-wrap">

          <button
            type="button"
            class="btn btn-primary"
            id="vat-27-btn"
            data-vat="27"
          >
            27%
          </button>

          <button
            type="button"
            class="btn btn-outline-secondary"
            id="vat-18-btn"
            data-vat="18"
          >
            18%
          </button>

          <button
            type="button"
            class="btn btn-outline-secondary"
            id="vat-5-btn"
            data-vat="5"
          >
            5%
          </button>

          <button
            type="button"
            class="btn btn-outline-secondary"
            id="vat-0-btn"
            data-vat="0"
          >
            0%
          </button>

        </div>

      </div>

    </div>
  `;
}
