import { ReturnProductSelector } from "./ProductSelector.js";
import { ReturnPriceInputs } from "./PriceInputs.js";
import { ReturnDateInputs } from "./DateInputs.js";

export async function ReturnCreateStockPanel() {
  return `
    <form class="row g-3 p-1 d-flex justify-content-center">

      ${ReturnProductSelector()}

      ${ReturnPriceInputs()}

      ${ReturnDateInputs()}

      <div class="col-12 col-md-10 d-grid">
        <button type="submit" class="btn btn-success">
          <i class="bi bi-floppy-fill me-2"></i>
          Készlet rögzítése
        </button>
      </div>

    </form>
  `;
}
