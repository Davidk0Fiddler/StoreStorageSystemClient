export function RenderStockProductCard(product) {
  return `
    <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">

      <div
        class="card product-card h-100"
        data-product-sku="${product.sku}"
      >

        <!-- Termékkép -->
        <div
          class="d-flex justify-content-center align-items-center p-2"
          style="height: 140px;"
        >

          <img
            src="${product.productImageURL ?? ""}"
            class="product-image img-fluid"
            style="max-height: 130px; max-width: 100%; object-fit: contain;"
            alt="${product.productName ?? "Termék"}"
          />

        </div>

        <!-- Terméknév -->
        <div
          class="card-body d-flex justify-content-center align-items-center p-2"
        >

          <div
            class="text-center fw-semibold"
          >
            ${product.productName ?? "Ismeretlen termék"}
          </div>

        </div>

      </div>

    </div>
  `;
}
