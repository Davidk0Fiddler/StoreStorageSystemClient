function ReturnActiveOrInactiveBadge(isActive) {
  if (isActive) {
    return `<span class="badge bg-success fs-6 px-3 py-2">Aktív</span>`;
  }

  return `<span class="badge bg-danger fs-6 px-3 py-2">Inaktív</span>`;
}

function GetDaysBetweenDates(date1, date2) {
  const [y1, m1, d1] = date1.split("-").map(Number);
  const [y2, m2, d2] = date2.split("-").map(Number);

  const firstDate = Date.UTC(y1, m1 - 1, d1);
  const secondDate = Date.UTC(y2, m2 - 1, d2);

  return Math.abs((secondDate - firstDate) / 86400000);
}

function GetTodayDate() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export function CreateStockRow(stock, onClick) {
  const row = document.createElement("tr");

  row.style.cursor = "pointer";

  const today = GetTodayDate();
  const differenceInDays = GetDaysBetweenDates(today, stock.expirationDate);

  if (stock.isActive) {
    if (differenceInDays <= 30 && differenceInDays > 0) {
      row.classList.add("expiring-soon");
    } else if (differenceInDays <= 0) {
      row.classList.add("expired");
    }
  }

  row.innerHTML = `
    <td>
      <div class="d-flex align-items-center">
        <img
          src="${stock.imageURL}"
          class="rounded border me-3"
          width="70"
          height="70"
        />

        <div>
          <div class="fw-bold">${stock.productName}</div>

          <small class="text-muted">
            ${stock.brand} • ${stock.productType}
          </small>
        </div>
      </div>
    </td>

    <td class="text-center">
      <div class="text-muted small">Mennyiség</div>

      <div class="fw-bold fs-5">
        ${stock.quantity} / ${stock.originalQuantity} ${stock.productSize}
      </div>
    </td>

    <td class="text-center">
      <div class="text-muted small">Ár / ${stock.productSize}</div>

      <div class="fw-bold fs-5">${stock.price} Ft</div>
    </td>

    <td class="text-center">
      <div class="text-muted small">Lejárati dátum</div>

      <div class="fw-bold fs-5">${stock.expirationDate}</div>
    </td>

    <td class="text-center">
      <div class="text-muted small">Állapot</div>

      ${ReturnActiveOrInactiveBadge(stock.isActive)}
    </td>
  `;

  row.addEventListener("click", () => onClick(stock.stockId));

  return row;
}
