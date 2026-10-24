const LIST_KEYS = [
  "items",
  "products",
  "stocks",
  "users",
  "brands",
  "productTypes",
  "productSizes",
  "documents",
  "sales",
  "productSales",
  "rows",
  "records",
  "results",
  "content",
  "stockItems",
  "productList",
  "stockList",
  "userList",
  "brandList",
  "productTypeList",
  "productSizeList",
  "data",
  "result",
  "value",
];

/** Extracts a list from the common API response envelopes used by the backend. */
export function NormalizeApiList(value, depth = 0) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object" || depth >= 5) return null;

  const actualKeys = new Map(Object.keys(value).map((key) => [key.toLowerCase(), key]));
  for (const key of LIST_KEYS) {
    const actualKey = actualKeys.get(key.toLowerCase());
    if (actualKey !== undefined) {
      const list = NormalizeApiList(value[actualKey], depth + 1);
      if (list) return list;
    }
  }

  return null;
}
