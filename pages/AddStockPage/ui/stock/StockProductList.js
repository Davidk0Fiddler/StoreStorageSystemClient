export function RenderStockProductList() {
  return `
    <div class="container-fluid h-100">

      <div class="row h-100">

        <!-- Terméklista -->
        <div class="col-lg-9">

          <div
            id="addstock-products-container"
            class="row g-3 overflow-auto"
            style="max-height: 75vh;"
          >
          </div>

        </div>

        <!-- Kiválasztott termék -->
        <div class="col-lg-3">

          <div
            class="card shadow-sm h-100"
          >

            <div class="card-header text-center">
              <h5 class="mb-0">
                Kiválasztott termék
              </h5>
            </div>

            <div
              class="card-body d-flex flex-column justify-content-center align-items-center text-center"
            >

              <img
                id="selected-product-image"
                data-product-image="true"
                class="img-fluid rounded mb-4"
                style="
                  max-height: 200px;
                  max-width: 100%;
                  object-fit: contain;
                "
                alt="Kiválasztott termék"
                loading="eager"
                decoding="async"
              />

              <h4
                id="selected-product-name"
                class="fw-bold mb-4"
              >
                Nincs kiválasztott termék
              </h4>

            </div>

            <div class="card-footer">

              <div class="d-flex flex-column gap-2">

                <button
                  type="button"
                  class="btn btn-outline-danger btn-lg"
                  id="stock-product-back-button"
                >
                  Vissza
                </button>

                <button
                  type="button"
                  class="btn btn-outline-primary btn-lg"
                  id="stock-product-next-button"
                >
                  Tovább
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
