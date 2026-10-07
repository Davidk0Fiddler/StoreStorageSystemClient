import { RenderBrandFilters } from "./BrandFilters.js";

export function RenderBrandPanel() {
  return `
    ${RenderBrandFilters()}

    <div
      class="row p-1 d-flex justify-content-evenly"
      id="brands-container"
    ></div>
  `;
}
