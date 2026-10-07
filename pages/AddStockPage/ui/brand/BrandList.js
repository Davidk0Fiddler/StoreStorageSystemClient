import { RenderBrandCard } from "./BrandCard.js";

/**
 * Márkák HTML-ének előállítása.
 */
export function RenderBrandList(brands) {
  return brands.map((brand) => RenderBrandCard(brand)).join("");
}

/**
 * Márkák megjelenítése.
 */
export function DisplayBrandList(brands) {
  const container = document.getElementById("brands-container");

  if (!container) {
    return;
  }

  container.innerHTML = RenderBrandList(brands);
}
