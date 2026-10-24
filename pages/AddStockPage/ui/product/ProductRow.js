import { ResolveProductThumbnailUrl } from "../../../shared/ProductImage.js";
import { EscapeHtml } from "../../../shared/Html.js";
function RenderProductActivationButton(isActive, productSKU) {
  const action = isActive ? "deactivate-product" : "activate-product";

  const buttonClass = isActive ? "btn-success" : "btn-danger";

  const icon = isActive ? "bi-toggle-on" : "bi-toggle-off";

  const statusText = isActive ? "Aktív" : "Inaktív";

  return `
    <button
      type="button"
      class="btn btn-sm ${buttonClass} rounded-3 px-3 py-2"
      data-action="${action}"
      data-product-sku="${EscapeHtml(productSKU)}"
    >
      <i class="bi ${icon} me-1"></i>
      ${statusText}
    </button>
  `;
}

export function RenderProductRow(product) {
  return `
    <tr>
      <td
        class="align-middle ps-4"
        style="width: 80px;"
      >
        <div
          class="d-flex align-items-center justify-content-center rounded-3 bg-body-tertiary border"
          style="width: 56px; height: 56px;"
        >
          <img
            data-product-image="true"
            src="${EscapeHtml(ResolveProductThumbnailUrl(product.thumbnailURL || product.thumbnailUrl || product.productThumbnailURL || product.productThumbnailUrl, product.productImageURL || product.imageURL))}"
            alt="${EscapeHtml(product.productName)}"
            style="width: 48px; height: 48px; object-fit: contain;"
            class="rounded-2"
            loading="lazy"
            decoding="async"
          />
        </div>
      </td>

      <td class="align-middle">
        <span class="fw-semibold">
          ${EscapeHtml(product.productName)}
        </span>
      </td>

      <td class="align-middle">
        <span class="font-monospace text-body-secondary">
          ${EscapeHtml(product.sku)}
        </span>
      </td>

      <td class="align-middle">
        <span
          class="badge rounded-pill bg-body-tertiary text-body-secondary border px-3 py-2"
        >
          ${EscapeHtml(product.brandName ?? product.brand ?? "-")}
        </span>
      </td>

      <td class="align-middle pe-4">
        <div class="d-flex justify-content-end gap-2">

          <button
            type="button"
            class="btn btn-sm btn-light border rounded-3 px-3 py-2"
            data-action="view-product"
            data-product-sku="${EscapeHtml(product.sku)}"
          >
            <i class="bi bi-info-circle me-1"></i>
            Részletek
          </button>

          <button
            type="button"
            class="btn btn-sm btn-primary rounded-3 px-3 py-2"
            data-action="edit-product"
            data-product-sku="${EscapeHtml(product.sku)}"
          >
            <i class="bi bi-pencil-square me-1"></i>
            Módosítás
          </button>

          ${RenderProductActivationButton(product.isActive, product.sku)}

        </div>
      </td>
    </tr>
  `;
}
