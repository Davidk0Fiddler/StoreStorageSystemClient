import { RenderProductSizeFilters } from "./ProductSizeFilters.js";

export function RenderProductSizePanel() {
  return `
    ${RenderProductSizeFilters()}

    <div
      class="row p-1 d-flex justify-content-evenly"
      id="ProductSizes-container"
    ></div>
  `;
}
