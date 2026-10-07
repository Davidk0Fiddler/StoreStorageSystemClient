export function RenderStockBarcode() {
  return `
    <div
      class="position-absolute top-50 start-50 translate-middle text-center w-100"
    >
      <div class="container">

        <label
          for="addstock-barcode-input"
          class="form-label fs-1 fw-bold mb-4"
        >
          Vonalkód
        </label>

        <div class="d-flex justify-content-center">
          <input
            type="text"
            id="addstock-barcode-input"
            class="form-control text-center fs-2"
            maxlength="13"
            style="width: 17ch; letter-spacing: 2px"
          />
        </div>

        <div class="d-flex justify-content-center gap-4 mt-5">

          <button
            type="button"
            class="btn btn-outline-danger btn-lg px-5 py-3 fs-4"
            id="stock-barcode-back-button"
          >
            Vissza
          </button>

          <button
            type="button"
            class="btn btn-outline-primary btn-lg px-5 py-3 fs-4"
            id="stock-barcode-next-button"
          >
            Tovább
          </button>

        </div>

      </div>
    </div>
  `;
}
