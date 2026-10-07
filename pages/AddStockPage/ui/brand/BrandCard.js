export function RenderBrandCard(brand) {
  const action = brand.isActive ? "deactivate-brand" : "activate-brand";

  const buttonClass = brand.isActive ? "btn-success" : "btn-danger";

  const icon = brand.isActive ? "bi-toggle-on" : "bi-toggle-off";

  const statusText = brand.isActive ? "Aktív" : "Inaktív";

  return `
    <div class="card col-3 m-2 brand-card">
      <div class="card-body p-3">

        <div class="brand-card-title">

          <div class="brand-card-icon">
            <i class="bi bi-building"></i>
          </div>

          <div class="brand-card-content">
            <span class="brand-card-label">
              Márkanév
            </span>

            <span
              class="brand-card-name"
            >
              ${brand.brandName}
            </span>
          </div>

        </div>

        <div class="row d-flex justify-content-evenly mt-3">

          <button
            type="button"
            class="btn brand-card-edit col-6 m-1"
            data-action="edit-brand"
            data-brand-id="${brand.id}"
          >
            <i class="bi bi-pencil me-1"></i>
            Módosítás
          </button>

          <button
            type="button"
            class="btn ${buttonClass} col-6 m-1"
            data-action="${action}"
            data-brand-id="${brand.id}"
          >
            <i
              class="bi ${icon}"
              style="cursor: pointer"
            ></i>

            ${statusText}
          </button>

        </div>

      </div>
    </div>
  `;
}
