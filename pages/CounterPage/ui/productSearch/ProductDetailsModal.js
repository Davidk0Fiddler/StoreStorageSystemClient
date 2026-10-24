import { SetProductImageSource } from "../../../shared/ProductImage.js";
export function RenderProductDetailsModal(product) {
  if (!product) {
    return;
  }

  const image = document.getElementById("details-product-image");
  const name = document.getElementById("details-product-name");
  const barcode = document.getElementById("details-product-barcode");
  const sku = document.getElementById("details-product-sku");
  const brand = document.getElementById("details-product-brand");
  const type = document.getElementById("details-product-type");
  const size = document.getElementById("details-product-size");
  const depositAmount = document.getElementById("details-deposit-amount");
  const depositBadge = document.getElementById("details-product-deposit");
  const ageRestrictionBadge = document.getElementById("details-product-age-restriction");

  SetProductImageSource(image, product.imageURL || product.productImageURL, { loading: "eager" });

  name.textContent = product.productName;

  barcode.textContent =
    product.barcode && product.barcode.trim() !== "" ? product.barcode : "-";

  sku.textContent = product.sku;

  brand.textContent = product.brand ?? "-";

  type.textContent = product.productType ?? "-";

  size.textContent = product.productSize ?? "-";

  depositAmount.textContent = product.hasDeposit
    ? `${product.depositAmount} Ft`
    : "Nincs";

  if (product.hasDeposit) {
    depositBadge.classList.remove("d-none");
    depositBadge.className = "badge bg-warning text-dark fs-6 px-3 py-2";
    depositBadge.textContent = "Betétdíjas";
  } else {
    depositBadge.classList.remove("d-none");
    depositBadge.className = "badge bg-secondary fs-6 px-3 py-2";
    depositBadge.textContent = "Nem betétdíjas";
  }

  const canBePurchasedByMinors = product.canBePurchasedByMinors !== false
    && String(product.canBePurchasedByMinors).toLowerCase() !== "false"
    && product.canBePurchasedByMinors !== 0;
  if (ageRestrictionBadge) {
    ageRestrictionBadge.classList.remove("d-none", "bg-success");
    ageRestrictionBadge.classList.toggle("bg-danger", !canBePurchasedByMinors);
    ageRestrictionBadge.classList.toggle("bg-success", canBePurchasedByMinors);
    ageRestrictionBadge.textContent = canBePurchasedByMinors
      ? "18 év alatt is vásárolható"
      : "Csak 18 éven felül";
  }
}

export function ShowProductDetailsModal() {
  const modal = new bootstrap.Modal(
    document.getElementById("product-details-modal"),
  );

  modal.show();
}
