export function FormatNumber(value, fractionDigits = 2) {
  return Number(value ?? 0).toLocaleString("hu-HU", {
    maximumFractionDigits: fractionDigits,
  });
}

export function FormatForint(value) {
  return `${Number(value ?? 0).toLocaleString("hu-HU")} Ft`;
}

export function GetTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
