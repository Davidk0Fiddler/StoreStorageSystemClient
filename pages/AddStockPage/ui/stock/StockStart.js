export function RenderStockStart() {
  return `
    <div
      class="row m-auto h-100 justify-content-center align-items-center g-4"
      style="min-height: 80vh"
    >
      <div
        class="col-4 btn btn-outline-secondary addstock-btn rounded m-2"
        id="create-stock-by-barcode"
        data-action="barcode"
      >
        <div
          class="d-flex flex-column justify-content-center align-items-center addstock-btn-body"
        >
          <i class="bi bi-upc-scan display-1 mb-3"></i>

          <h5 class="text-center mb-0 fs-3">
            Vonalkód alapján
          </h5>
        </div>
      </div>

      <div
        class="col-4 btn btn-outline-secondary addstock-btn rounded m-2"
        id="create-stock-by-selecting-product"
        data-action="product"
      >
        <div
          class="d-flex flex-column justify-content-center align-items-center addstock-btn-body"
        >
          <i class="bi bi-archive display-1 mb-3"></i>

          <h5 class="text-center mb-0 fs-3">
            Termék kiválasztása
          </h5>
        </div>
      </div>
    </div>
  `;
}
