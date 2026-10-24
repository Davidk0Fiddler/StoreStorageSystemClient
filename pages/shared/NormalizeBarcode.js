export function NormalizeBarcode(value) {
  return String(value ?? "").replace(/[öÖ]/g, "0").trim();
}
