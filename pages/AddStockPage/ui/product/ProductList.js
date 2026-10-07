import { RenderProductRow } from "./ProductRow.js";

export function RenderProductList(products) {
  return products.map((product) => RenderProductRow(product)).join("");
}

export function DisplayProductList(products) {
  const container = document.getElementById("products-table-body");

  if (!container) return;

  container.innerHTML = RenderProductList(products);
}
