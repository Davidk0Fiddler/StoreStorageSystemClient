import { RenderProductTypeFilters } from "./ProductTypeFilters.js";

export function RenderProductTypePanel() {
  return `
    ${RenderProductTypeFilters()}

    <div
      class="row p-1 d-flex justify-content-evenly"
      id="producttypes-container"
    ></div>
  `;
}
