function getDateOnly(value) {
  if (!value) return "";
  const date = String(value).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  const parsed = new Date(`${date}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date
    ? ""
    : date;
}

export function IsExpiredStock(stockOrDate) {
  const value = typeof stockOrDate === "object" && stockOrDate !== null
    ? stockOrDate.expirationDate ?? stockOrDate.expiryDate
    : stockOrDate;
  const expirationDate = getDateOnly(value);
  if (!expirationDate) return false;

  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return expirationDate <= todayDate;
}

export function RenderExpiredStockBadge(stockOrDate, className = "") {
  if (!IsExpiredStock(stockOrDate)) return "";
  return `<span class="badge bg-danger ${className}">Lejárt</span>`;
}
