export function RenderStockDetails() {
  return `
    <div class="row align-items-center">

      <div class="col-md-3 text-center">
        <img
          id="addstock-selected-product-image"
          data-product-image="true"
          class="img-fluid rounded"
          style="max-height: 150px;"
          alt="Kiválasztott termék"
          loading="eager"
          decoding="async"
        />
      </div>

      <div class="col-md-6">
        <div class="text-center">

          <h3
            id="addstock-selected-product-name"
            class="fw-bold mb-3"
          >
            -
          </h3>

          <div class="row g-2 text-start">

            <div class="col-sm-6">
              <strong>Vonalkód:</strong>
              <span id="addstock-selected-product-barcode">-</span>
            </div>

            <div class="col-sm-6">
              <strong>SKU:</strong>
              <span id="addstock-selected-product-sku">-</span>
            </div>

            <div class="col-sm-6">
              <strong>Márka:</strong>
              <span id="addstock-selected-product-brand">-</span>
            </div>

            <div class="col-sm-6">
              <strong>Terméktípus:</strong>
              <span id="addstock-selected-product-type">-</span>
            </div>

            <div class="col-sm-6">
              <strong>Termékméret:</strong>
              <span id="addstock-selected-product-size">-</span>
            </div>

          </div>

        </div>
      </div>

      <div class="col-md-3 d-flex justify-content-center">

        <button
          type="button"
          class="btn btn-outline-danger btn-lg px-4"
          id="stock-details-back-button"
        >
          Vissza
        </button>

      </div>

    </div>
  `;
}
