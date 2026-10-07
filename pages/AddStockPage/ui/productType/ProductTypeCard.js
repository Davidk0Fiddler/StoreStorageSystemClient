export function RenderProductTypeCard(productType) {
  const action = productType.isActive
    ? "deactivate-producttype"
    : "activate-producttype";

  const buttonClass = productType.isActive ? "btn-success" : "btn-danger";

  const icon = productType.isActive ? "bi-toggle-on" : "bi-toggle-off";

  const statusText = productType.isActive ? "Aktív" : "Inaktív";

  return `
    <div class="card col-3 m-2 border-0 shadow-sm rounded-4 product-type-card">
      <div class="card-body p-4">

        <div class="d-flex justify-content-between align-items-start">

          <div class="d-flex align-items-center">

            <div class="rounded-3 bg-primary bg-opacity-10 p-2 me-3">
              <i class="bi bi-box-seam text-primary fs-4"></i>
            </div>

            <div>
              <div class="text-muted small">
                Terméktípus
              </div>

              <div class="fw-bold fs-5 mt-1">
                ${productType.typeName}
              </div>
            </div>

          </div>

          <span
            class="badge rounded-pill bg-success bg-opacity-10 text-success px-3 py-2"
          >
            ${statusText}
          </span>

        </div>

        <div class="d-flex gap-2 mt-4">

          <button
            type="button"
            class="btn btn-primary flex-fill rounded-3"
            data-action="edit-producttype"
            data-product-type-id="${productType.id}"
          >
            <i class="bi bi-pencil me-2"></i>
            Módosítás
          </button>

          <button
            type="button"
            class="btn ${buttonClass} col-6 m-1 py-2"
            data-action="${action}"
            data-product-type-id="${productType.id}"
          >
            <i class="bi ${icon}"></i>
            ${statusText}
          </button>

        </div>

      </div>
    </div>
  `;
}
