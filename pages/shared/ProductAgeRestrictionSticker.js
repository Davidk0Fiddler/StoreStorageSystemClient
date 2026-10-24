export function RenderProductAgeRestrictionSticker(product) {
  const value = product?.canBePurchasedByMinors;
  const canBePurchasedByMinors =
    value !== false && value !== 0 && String(value).toLowerCase() !== "false";

  if (canBePurchasedByMinors) {
    return "";
  }

  return `
    <span
      class="product-age-restriction-sticker"
      role="img"
      aria-label="Csak 18 éven felül vásárolható"
      title="Csak 18 éven felül vásárolható"
    >18+</span>
  `;
}
