import { RenderProductTypeCard } from "./ProductTypeCard.js";

export function RenderProductTypeList(productTypes) {
  return productTypes
    .map((productType) => RenderProductTypeCard(productType))
    .join("");
}

export function DisplayProductTypeList(productTypes) {
  const container = document.getElementById("producttypes-container");

  if (!container) return;

  container.innerHTML = RenderProductTypeList(productTypes);
}
