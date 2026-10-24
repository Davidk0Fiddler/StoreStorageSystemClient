import { ResolveProductThumbnailUrl } from "../../../shared/ProductImage.js";
import { EscapeHtml } from "../../../shared/Html.js";
import { RenderProductAgeRestrictionSticker } from "../../../shared/ProductAgeRestrictionSticker.js";

export function RenderProductSearchList(products, onProductSelected) {
  const productListArea = document.getElementById("product-list");

  if (!productListArea) {
    return;
  }

  productListArea.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");

    productCard.classList.add("col");
    productCard.style.cursor = "pointer";

    productCard.innerHTML = `
      <div class="card product-card h-100 position-relative">
        ${RenderProductAgeRestrictionSticker(product)}
        <img
          data-product-image="true"
          src="${EscapeHtml(ResolveProductThumbnailUrl(product.thumbnailURL || product.thumbnailUrl || product.productThumbnailURL || product.productThumbnailUrl, product.imageURL || product.productImageURL))}"
          class="card-img-top product-image"
          alt="${EscapeHtml(product.productName ?? "Termék")}"
          loading="lazy"
          decoding="async"
        />

        <div class="card-body text-center">
          <h6 class="mb-0">
          ${EscapeHtml(product.productName ?? "Ismeretlen termék")}
          </h6>
        </div>
      </div>
    `;

    const card = productCard.querySelector(".product-card");

    productCard.addEventListener("click", () => {
      const previouslySelected = document.querySelector(
        ".product-card.selected",
      );

      if (previouslySelected) {
        previouslySelected.classList.remove("selected");
      }

      card.classList.add("selected");

      onProductSelected(product);
    });

    productListArea.appendChild(productCard);
  });
}
