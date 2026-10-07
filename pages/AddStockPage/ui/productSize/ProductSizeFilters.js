export function RenderProductSizeFilters() {
  return `
    <div class="productsize-filter-bar mb-3">

      <!-- Összes -->
      <div
        class="productsize-filter active"
        id="all-ProductSizes-button"
      >
        <div class="productsize-filter-icon">
          <i class="bi bi-rulers"></i>
        </div>

        <div class="productsize-filter-content">
          <span class="productsize-filter-label">
            Összes termékméret
          </span>

          <span
            class="productsize-filter-count"
            id="all-ProductSizes-area"
          >
            0
          </span>
        </div>
      </div>

      <!-- Aktív -->
      <div
        class="productsize-filter"
        id="all-active-ProductSizes-button"
      >
        <div class="productsize-filter-icon">
          <i class="bi bi-check-circle"></i>
        </div>

        <div class="productsize-filter-content">
          <span class="productsize-filter-label">
            Aktív termékméretek
          </span>

          <span
            class="productsize-filter-count"
            id="all-active-ProductSizes-area"
          >
            0
          </span>
        </div>
      </div>

      <!-- Inaktív -->
      <div
        class="productsize-filter"
        id="all-inactive-ProductSizes-button"
      >
        <div class="productsize-filter-icon">
          <i class="bi bi-pause-circle"></i>
        </div>

        <div class="productsize-filter-content">
          <span class="productsize-filter-label">
            Inaktív termékméretek
          </span>

          <span
            class="productsize-filter-count"
            id="all-inactive-ProductSizes-area"
          >
            0
          </span>
        </div>
      </div>

      <!-- Létrehozás -->
      <div class="productsize-create-wrapper">
        <button
          type="button"
          class="productsize-create-button"
          id="open-ProductSize-creation-modal-button"
        >
          <i class="bi bi-rulers me-2"></i>
          Termékméret létrehozása
        </button>
      </div>

    </div>
  `;
}
