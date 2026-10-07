export function RenderProductTypeFilters() {
  return `
    <div class="producttype-filter-bar mb-3">

      <!-- Összes -->
      <div
        class="producttype-filter active"
        id="all-producttypes-button"
      >
        <div class="producttype-filter-icon">
          <i class="bi bi-bookmarks"></i>
        </div>

        <div class="producttype-filter-content">
          <span class="producttype-filter-label">
            Összes terméktípus
          </span>

          <span
            id="all-producttypes-area"
            class="producttype-filter-count"
          >
            0
          </span>
        </div>
      </div>

      <!-- Aktív -->
      <div
        class="producttype-filter"
        id="all-active-producttypes-button"
      >
        <div class="producttype-filter-icon">
          <i class="bi bi-check-circle"></i>
        </div>

        <div class="producttype-filter-content">
          <span class="producttype-filter-label">
            Aktív terméktípusok
          </span>

          <span
            id="all-active-producttypes-area"
            class="producttype-filter-count"
          >
            0
          </span>
        </div>
      </div>

      <!-- Inaktív -->
      <div
        class="producttype-filter"
        id="all-inactive-producttypes-button"
      >
        <div class="producttype-filter-icon">
          <i class="bi bi-pause-circle"></i>
        </div>

        <div class="producttype-filter-content">
          <span class="producttype-filter-label">
            Inaktív terméktípusok
          </span>

          <span
            id="all-inactive-producttypes-area"
            class="producttype-filter-count"
          >
            0
          </span>
        </div>
      </div>

      <!-- Létrehozás -->
      <div class="producttype-create-wrapper">
        <button
          type="button"
          class="producttype-create-button"
          id="open-producttype-creation-modal-button"
        >
          <i class="bi bi-bookmark-plus me-2"></i>
          Terméktípus létrehozása
        </button>
      </div>

    </div>
  `;
}
