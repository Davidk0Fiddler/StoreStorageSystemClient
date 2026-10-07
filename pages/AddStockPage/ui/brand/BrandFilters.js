export function RenderBrandFilters() {
  return `
    <div class="brand-filter-bar mb-3">

      <div class="brand-filter active" id="all-brands-button">
        <div class="brand-filter-icon">
          <i class="bi bi-tags"></i>
        </div>

        <div class="brand-filter-content">
          <span class="brand-filter-label">
            Összes márka
          </span>

          <span
            id="all-brands-area"
            class="brand-filter-count"
          >
            0
          </span>
        </div>
      </div>

      <div
        class="brand-filter"
        id="all-active-brands-button"
      >
        <div class="brand-filter-icon">
          <i class="bi bi-check-circle"></i>
        </div>

        <div class="brand-filter-content">
          <span class="brand-filter-label">
            Aktív márkák
          </span>

          <span
            id="all-active-brands-area"
            class="brand-filter-count"
          >
            0
          </span>
        </div>
      </div>

      <div
        class="brand-filter"
        id="all-inactive-brands-button"
      >
        <div class="brand-filter-icon">
          <i class="bi bi-pause-circle"></i>
        </div>

        <div class="brand-filter-content">
          <span class="brand-filter-label">
            Inaktív márkák
          </span>

          <span
            id="all-inactive-brands-area"
            class="brand-filter-count"
          >
            0
          </span>
        </div>
      </div>

      <div class="brand-create-wrapper">
        <button
          class="brand-create-button"
          id="open-brand-creation-modal-button"
        >
          <i class="bi bi-building-add"></i>
          Márka létrehozása
        </button>
      </div>

    </div>
  `;
}
