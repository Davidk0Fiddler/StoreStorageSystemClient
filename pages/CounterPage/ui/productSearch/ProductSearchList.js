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
      <div class="card product-card h-100">
        <img
          src="${product.imageURL ?? ""}"
          class="card-img-top product-image"
          alt="${product.productName ?? "Termék"}"
        />

        <div class="card-body text-center">
          <h6 class="mb-0">
            ${product.productName ?? "Ismeretlen termék"}
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
