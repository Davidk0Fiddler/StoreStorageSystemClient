import { RenderProductSizeCard } from "./ProductSizeCard.js";

export function RenderProductSizeList(productSizes) {
  return productSizes
    .map((productSize) => RenderProductSizeCard(productSize))
    .join("");
}

export function DisplayProductSizeList(productSizes) {
  const container = document.getElementById("ProductSizes-container");

  if (!container) return;

  container.innerHTML = RenderProductSizeList(productSizes);
}
