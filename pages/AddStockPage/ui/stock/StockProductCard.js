import { ResolveProductThumbnailUrl } from "../../../shared/ProductImage.js";
import { EscapeHtml } from "../../../shared/Html.js";
import { RenderProductAgeRestrictionSticker } from "../../../shared/ProductAgeRestrictionSticker.js";

export function RenderStockProductCard(product) {
  return `
    <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6">

      <div
        class="card product-card h-100"
        data-product-sku="${EscapeHtml(product.sku)}"
        style="position: relative;"
      >
        ${RenderProductAgeRestrictionSticker(product)}

        <!-- Termékkép -->
        <div
          class="d-flex justify-content-center align-items-center p-2"
          style="height: 140px;"
        >

          <img
            data-product-image="true"
            src="${EscapeHtml(ResolveProductThumbnailUrl(product.thumbnailURL || product.thumbnailUrl || product.productThumbnailURL || product.productThumbnailUrl, product.productImageURL || product.imageURL))}"
            class="product-image img-fluid"
            style="max-height: 130px; max-width: 100%; object-fit: contain;"
            alt="${EscapeHtml(product.productName ?? "Termék")}"
            loading="lazy"
            decoding="async"
          />

        </div>

        <!-- Terméknév -->
        <div
          class="card-body d-flex justify-content-center align-items-center p-2"
        >

          <div
            class="text-center fw-semibold"
          >
            ${EscapeHtml(product.productName ?? "Ismeretlen termék")}
          </div>

        </div>

      </div>

    </div>
  `;
}
