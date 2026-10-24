import { RenderStockDetails } from "./StockDetails.js";
import { RenderStockPriceCalculator } from "./StockPriceCalculator.js";

export function RenderStockPanel() {
  return `
    <div class="container-fluid py-3">

      <!-- Kiválasztott termék -->
      <div class="card shadow-sm mb-4">
        <div class="card-header">
          <h4 class="mb-0">
            Kiválasztott termék
          </h4>
        </div>

        <div class="card-body">
          ${RenderStockDetails()}
        </div>
      </div>

      <!-- Készlet adatok -->
      <div class="card shadow-sm mb-4">
        <div class="card-header">
          <h4 class="mb-0">
            Készlet adatai
          </h4>
        </div>

        <div class="card-body">

          <div class="row g-4">

            <!-- Mennyiség -->
            <div class="col-md-6">

              <label
                for="addstock-quantity"
                class="form-label fw-semibold"
              >
                Mennyiség
              </label>

              <div class="input-group input-group-lg">

                <input
                  type="number"
                  id="addstock-quantity"
                  class="form-control"
                  min="0"
                  step="0.01"
                  required
                />

                <span class="input-group-text">
                  db
                </span>

              </div>

            </div>

            <!-- Számított árak -->
            <div class="col-12">
              ${RenderStockPriceCalculator()}
            </div>

          </div>

        </div>
      </div>

      <!-- Bizonylat / szállítás -->
      <div class="card shadow-sm mb-4">

        <div class="card-header">
          <h4 class="mb-0">
            Szállítási adatok
          </h4>
        </div>

        <div class="card-body">

          <div class="row g-4">

            <!-- Számla -->
            <div class="col-md-6">

              <label
                for="addstock-invoice-id"
                class="form-label fw-semibold"
              >
                Számla azonosító
              </label>

              <input
                type="text"
                id="addstock-invoice-id"
                class="form-control form-control-lg"
                required
              />

            </div>

            <!-- Szállítólevél -->
            <div class="col-md-6">

              <label
                for="addstock-transit-id"
                class="form-label fw-semibold"
              >
                Szállítás azonosító
              </label>

              <input
                type="text"
                id="addstock-transit-id"
                class="form-control form-control-lg"
                required
              />

            </div>

            <!-- Lejárati idő -->
            <div class="col-md-6">

              <label
                for="addstock-expiration-date"
                class="form-label fw-semibold"
              >
                Lejárati idő
              </label>

              <input
                type="date"
                id="addstock-expiration-date"
                class="form-control form-control-lg"
                required
              />

            </div>

            <!-- Beérkezés -->
            <div class="col-md-6">

              <label
                for="addstock-received-at"
                class="form-label fw-semibold"
              >
                Beérkezés időpontja
              </label>

              <input
                type="datetime-local"
                id="addstock-received-at"
                class="form-control form-control-lg"
                required
              />

            </div>

          </div>

        </div>
      </div>

      ${sessionStorage.getItem("roleName") === "Admin" ? `
        <div class="card shadow-sm mb-4">
          <div class="card-header">
            <h4 class="mb-0"><i class="bi bi-file-earmark-pdf me-2"></i>Bizonylatok</h4>
          </div>
          <div class="card-body">
            <div class="alert alert-info mb-0">
              A számlát és a szállítólevelet az áru rögzítése után lehet ehhez a készlettételhez csatolni.
            </div>
          </div>
        </div>
      ` : ""}

      <!-- Műveletek -->
      <div class="d-flex justify-content-end gap-3 pb-4">

        <button
          type="button"
          class="btn btn-outline-danger btn-lg px-5"
          id="stock-panel-back-button"
        >
          Vissza
        </button>

        <button
          type="button"
          class="btn btn-primary btn-lg px-5"
          id="stock-panel-save-button"
        >
          <i class="bi bi-plus-circle me-2"></i>
          Áru hozzáadása
        </button>

      </div>

    </div>
  `;
}
