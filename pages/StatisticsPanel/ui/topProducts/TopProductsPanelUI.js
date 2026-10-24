import { SetProductImageSource } from "../../../shared/ProductImage.js";
import { FormatNumber } from "../../features/shared/formatters.js";

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function formatQuantity(quantity, unit) {
  return `${FormatNumber(quantity)} ${unit}`;
}

function renderSummary(report) {
  const total = document.getElementById("sold-products-total");
  if (total) {
    total.replaceChildren(
      ...report.totalByUnit.map(({ unit, quantity }) => {
        const line = document.createElement("div");
        line.className = "fs-3";
        line.textContent = formatQuantity(quantity, unit);
        return line;
      }),
    );
    if (!report.totalByUnit.length) total.textContent = "0 db";
  }

  const typeList = document.getElementById("sold-products-by-type");
  if (!typeList) return;
  typeList.replaceChildren();
  for (const group of report.byType) {
    const row = document.createElement("div");
    row.className = "d-flex justify-content-between gap-2 border-bottom py-2";
    const type = document.createElement("span");
    type.textContent = group.productType;
    const quantity = document.createElement("strong");
    quantity.textContent = formatQuantity(group.quantity, group.unit);
    row.append(type, quantity);
    typeList.appendChild(row);
  }
}

function renderSelectedProduct(product) {
  document.getElementById("sold-product-empty")?.classList.add("d-none");
  document.getElementById("sold-product-selected")?.classList.remove("d-none");
  setText("selected-product-name", product.name);
  setText("selected-product-sku", product.sku || "-");
  setText("selected-product-sku-detail", product.sku || "-");
  setText("selected-product-brand", product.brand || "-");
  setText("selected-product-type", product.productType || "-");
  setText("selected-product-description", product.description || "Nincs leírás.");
  setText("selected-product-total", formatQuantity(product.quantity, product.unit));
  const image = document.getElementById("selected-product-image");
  if (image) {
    const imageUrl = product.imageUrl || product.imageURL || product.productImageURL;
    SetProductImageSource(image, product.thumbnailUrl || product.thumbnailURL || product.productThumbnailURL || imageUrl, { loading: "eager" });
    image.classList.remove("d-none");
  }
}

function renderProducts(products) {
  const list = document.getElementById("sold-products-list");
  if (!list) return;
  list.replaceChildren();
  if (!products.length) {
    list.textContent = "Nincs eladási adat";
    return;
  }

  products.forEach((product, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-light border rounded-3 text-start p-3";
    button.setAttribute("aria-label", `${product.name}, ${formatQuantity(product.quantity, product.unit)}`);

    const row = document.createElement("span");
    row.className = "d-flex align-items-center gap-3";
    const rank = document.createElement("strong");
    rank.className = "text-body-secondary";
    rank.textContent = `#${index + 1}`;
    const details = document.createElement("span");
    details.className = "flex-grow-1 min-w-0";
    const name = document.createElement("span");
    name.className = "d-block fw-semibold text-truncate";
    name.textContent = product.name;
    const metadata = document.createElement("small");
    metadata.className = "d-block text-body-secondary";
    metadata.textContent = `${product.productType} · ${product.brand} · ${product.sku || "-"}`;
    const quantity = document.createElement("strong");
    quantity.textContent = formatQuantity(product.quantity, product.unit);
    details.append(name, metadata);
    row.append(rank, details, quantity);
    button.appendChild(row);
    button.addEventListener("click", () => renderSelectedProduct(product));
    list.appendChild(button);
  });
}

export function RenderTopProductsReport(report) {
  renderSummary(report);
  renderProducts(report.products);
  if (report.products[0]) renderSelectedProduct(report.products[0]);
}

