import { FormatForint } from "../../features/shared/formatters.js";
import { CreatePurchaseDetailsModalMarkup } from "./PurchaseDetailsLayout.js";

function EnsurePurchaseDetailsModal() {
  if (document.getElementById("shoplog-details-modal")) return;
  const host = document.createElement("div");
  host.innerHTML = CreatePurchaseDetailsModalMarkup();
  document.body.appendChild(host);
}

function appendField(parent, label, value, className = "") {
  const container = document.createElement("div");
  const title = document.createElement("span");
  title.className = "text-body-secondary";
  title.textContent = `${label}: `;
  const content = document.createElement("span");
  content.className = className;
  content.textContent = String(value ?? "-");
  container.append(title, content);
  parent.appendChild(container);
}

function renderProducts(productsJson) {
  const area = document.getElementById("shoplog-products-area");
  area.replaceChildren();

  let products;
  try {
    products = typeof productsJson === "string" ? JSON.parse(productsJson) : productsJson;
    if (!Array.isArray(products)) throw new Error("Invalid products list");
  } catch {
    const error = document.createElement("div");
    error.className = "alert alert-danger rounded-3";
    error.textContent = "A vásárolt termékek adatai nem olvashatók.";
    area.appendChild(error);
    return;
  }

  for (const product of products) {
    const row = document.createElement("div");
    row.className = "bg-body rounded-4 p-3 mb-2";
    const grid = document.createElement("div");
    grid.className = "row align-items-center g-3";

    const identity = document.createElement("div");
    identity.className = "col-lg-5";
    const name = document.createElement("div");
    name.className = "fw-bold fs-5";
    name.textContent = product.ProductName ?? "-";
    const brand = document.createElement("div");
    brand.className = "small text-body-secondary";
    brand.textContent = product.Brand ?? "";
    identity.append(name, brand);

    const identifiers = document.createElement("div");
    identifiers.className = "col-lg-3 small";
    appendField(identifiers, "SKU", product.SKU, "fw-semibold");
    if (product.Barcode) appendField(identifiers, "Vonalkód", product.Barcode, "fw-semibold");

    const amount = document.createElement("div");
    amount.className = "col-lg-2";
    const amountLabel = document.createElement("div");
    amountLabel.className = "small text-body-secondary";
    amountLabel.textContent = "Mennyiség";
    const quantity = document.createElement("div");
    quantity.className = "fw-bold fs-5";
    quantity.textContent = String(product.Quantity ?? 0);
    const unitPrice = document.createElement("div");
    unitPrice.className = "small text-body-secondary";
    unitPrice.textContent = `${FormatForint(product.UnitPrice)} / egység`;
    amount.append(amountLabel, quantity, unitPrice);

    const price = document.createElement("div");
    price.className = "col-lg-2 text-lg-end";
    const total = Number(product.Quantity ?? 0) * Number(product.UnitPrice ?? 0);
    const totalElement = document.createElement("div");
    totalElement.className = "fw-bold fs-4";
    totalElement.textContent = FormatForint(total);
    price.appendChild(totalElement);
    if (Number(product.DepositAmount ?? 0) > 0) {
      const deposit = document.createElement("span");
      deposit.className = "badge text-bg-warning rounded-pill";
      deposit.textContent = `+${FormatForint(product.DepositAmount)}`;
      price.appendChild(deposit);
    }

    grid.append(identity, identifiers, amount, price);
    row.appendChild(grid);
    area.appendChild(row);
  }
}

export function ShowPurchaseDetails(shopLog) {
  EnsurePurchaseDetailsModal();
  document.getElementById("shoplog-date").textContent = new Date(
    shopLog.dateTime,
  ).toLocaleString("hu-HU");
  document.getElementById("shoplog-products-count").textContent = shopLog.productsCount;
  document.getElementById("shoplog-products-count-stat").textContent = `${shopLog.productsCount} tétel`;
  document.getElementById("shoplog-products-price").textContent = FormatForint(shopLog.productsPriceSUM);
  document.getElementById("shoplog-deposit").textContent = FormatForint(shopLog.depositSUM);
  document.getElementById("shoplog-deposit-bottom").textContent = FormatForint(shopLog.depositSUM);
  document.getElementById("shoplog-total-price").textContent = FormatForint(shopLog.totalPrice);
  document.getElementById("shoplog-total-price-bottom").textContent = FormatForint(shopLog.totalPrice);
  renderProducts(shopLog.productsJson);
  bootstrap.Modal.getOrCreateInstance(
    document.getElementById("shoplog-details-modal"),
  ).show();
}
