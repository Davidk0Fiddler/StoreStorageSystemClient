import { EscapeHtml } from "../../../shared/Html.js";

export function RenderProductSizeCard(productSize) {
  const action = productSize.isActive
    ? "deactivate-productsize"
    : "activate-productsize";

  const buttonClass = productSize.isActive ? "btn-success" : "btn-danger";

  const icon = productSize.isActive ? "bi-toggle-on" : "bi-toggle-off";

  const statusText = productSize.isActive ? "Aktív" : "Inaktív";

  return `
    <div class="card col-3 m-2">
      <div class="card-body p-3">
        Termékméret:
        <span
          id="ProductSize-name-area"
          class="fw-bold"
        >
          ${EscapeHtml(productSize.sizeName)}
        </span>

        <div class="row d-flex justify-content-evenly mt-3">

          <button
            type="button"
            class="btn btn-secondary col-6 m-1"
            data-action="edit-productsize"
            data-product-size-id="${EscapeHtml(productSize.id)}"
          >
            <i class="bi bi-pencil"></i>
            Módosítás
          </button>

          <button
            type="button"
            class="btn ${buttonClass} col-6 m-1"
            data-action="${action}"
            data-product-size-id="${EscapeHtml(productSize.id)}"
          >
            <i class="bi ${icon}"></i>
            ${statusText}
          </button>

        </div>
      </div>
    </div>
  `;
}
