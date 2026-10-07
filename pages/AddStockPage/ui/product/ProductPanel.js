export function RenderProductPanel() {
  return `
    <div class="product-filter-bar mb-3">

      <!-- Szűrés eltávolítása -->
      <div
        class="product-filter d-none"
        id="dismiss-search-filter-button"
      >
        <div class="product-filter-icon">
          <i class="bi bi-x-circle"></i>
        </div>

        <div class="product-filter-content">
          <span class="product-filter-label">
            Szűrés eltávolítása
          </span>
        </div>
      </div>

      <!-- Keresés -->
      <div
        class="product-filter"
        id="open-product-search-modal-button"
        data-bs-toggle="modal"
        data-bs-target="#product-search-modal"
      >
        <div class="product-filter-icon">
          <i class="bi bi-search"></i>
        </div>

        <div class="product-filter-content">
          <span class="product-filter-label">
            Termék keresése
          </span>
        </div>
      </div>

      <!-- Termék létrehozása -->
      <div class="product-create-wrapper">
        <button
          type="button"
          class="product-create-button"
          id="open-product-creation-modal-button"
          data-bs-toggle="modal"
          data-bs-target="#product-create-modal"
        >
          <i class="bi bi-plus-lg"></i>
          Termék létrehozása
        </button>
      </div>

    </div>

    <div
      class="row p-1 d-flex justify-content-evenly"
      id="products-container"
    >
      <table class="table text-center">
        <thead>
          <tr>
            <th scope="col" class="ps-4">
              Kép
            </th>

            <th scope="col">
              Terméknév
            </th>

            <th scope="col">
              SKU
            </th>

            <th scope="col">
              Márkanév
            </th>

            <th
              scope="col"
              class="text-end pe-4"
            >
              További lehetőségek
            </th>
          </tr>
        </thead>

        <tbody
          class="table-group-divider align-middle"
          id="products-table-body"
        ></tbody>
      </table>
    </div>
  `;
}
