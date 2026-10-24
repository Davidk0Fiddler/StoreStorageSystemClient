import { ResolveProductThumbnailUrl } from "../../shared/ProductImage.js";
import { EscapeHtml } from "../../shared/Html.js";
import { IsExpiredStock, RenderExpiredStockBadge } from "../../shared/ExpiredStockBadge.js";
function ReturnActiveOrInactiveBadge(isActive) {
  if (isActive) {
    return `<span class="badge bg-success fs-6 px-3 py-2">Aktív</span>`;
  }

  return `<span class="badge bg-danger fs-6 px-3 py-2">Inaktív</span>`;
}

function GetDaysUntilDate(date1, date2) {
  const [y1, m1, d1] = date1.split("-").map(Number);
  const [y2, m2, d2] = date2.split("-").map(Number);

  const firstDate = Date.UTC(y1, m1 - 1, d1);
  const secondDate = Date.UTC(y2, m2 - 1, d2);

  return (secondDate - firstDate) / 86400000;
}

function GetTodayDate() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export function CreateStockRow(stock, onClick) {
  const row = document.createElement("tr");

  row.style.cursor = "pointer";

  const today = GetTodayDate();
  const daysUntilExpiration = GetDaysUntilDate(today, stock.expirationDate);

  if (stock.isActive) {
    if (IsExpiredStock(stock)) {
      row.classList.add("expired");
    } else if (daysUntilExpiration <= 30) {
      row.classList.add("expiring-soon");
    }
  }

  row.innerHTML = `
    <td>
      <div class="d-flex align-items-center">
        <img
          data-product-image="true"
          src="${EscapeHtml(ResolveProductThumbnailUrl(stock.thumbnailURL || stock.thumbnailUrl || stock.product?.thumbnailURL || stock.product?.thumbnailUrl || stock.product?.productThumbnailURL || stock.product?.productThumbnailUrl, stock.imageURL || stock.product?.imageURL || stock.product?.productImageURL))}"
          class="rounded border me-3"
          width="70"
          height="70"
          alt="${EscapeHtml(stock.productName ?? "Termék")}"
          loading="lazy"
          decoding="async"
        />

        <div>
          <div class="fw-bold">${EscapeHtml(stock.productName)} ${RenderExpiredStockBadge(stock, "ms-1")}</div>

          <small class="text-muted">
            ${EscapeHtml(stock.brand)} • ${EscapeHtml(stock.productType)}
          </small>
        </div>
      </div>
    </td>

    <td class="text-center">
      <div class="text-muted small">Mennyiség</div>

      <div class="fw-bold fs-5">
        ${EscapeHtml(stock.quantity)} / ${EscapeHtml(stock.originalQuantity)} ${EscapeHtml(stock.productSize)}
      </div>
    </td>

    <td class="text-center">
      <div class="text-muted small">Ár / ${EscapeHtml(stock.productSize)}</div>

      <div class="fw-bold fs-5">${EscapeHtml(stock.price)} Ft</div>
    </td>

    <td class="text-center">
      <div class="text-muted small">Lejárati dátum</div>

      <div class="fw-bold fs-5">${EscapeHtml(stock.expirationDate)}</div>
    </td>

    <td class="text-center">
      <div class="text-muted small">Állapot</div>

      ${ReturnActiveOrInactiveBadge(stock.isActive)}
    </td>
  `;

  row.addEventListener("click", () => onClick(stock.stockId));

  return row;
}
