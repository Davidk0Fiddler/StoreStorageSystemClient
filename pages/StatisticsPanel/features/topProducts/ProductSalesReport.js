function getNumber(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
}

function getUnit(product) {
  const rawUnit = String(
    product.productSize ?? product.unit ?? product.productUnit ?? "db",
  ).trim().toLowerCase();

  if (["kg", "kilogram", "kilogramm"].includes(rawUnit)) return "kg";
  if (["g", "gramm"].includes(rawUnit)) return "g";
  if (["l", "liter", "litre"].includes(rawUnit)) return "l";
  if (["ml", "milliliter", "millilitre"].includes(rawUnit)) return "ml";
  return "db";
}

export function BuildProductSalesReport(salesRows, productRows = []) {
  const productBySku = new Map(
    (Array.isArray(productRows) ? productRows : []).map((product) => [
      String(product.sku ?? product.SKU ?? ""),
      product,
    ]),
  );

  const products = (Array.isArray(salesRows) ? salesRows : [])
    .map((sales) => {
      const sku = String(sales.sku ?? sales.SKU ?? "");
      const details = productBySku.get(sku) ?? {};
      const quantity = getNumber(
        sales.totalPurchased,
        sales.quantity,
        sales.Quantity,
        sales.soldQuantity,
      );

      return {
        sku,
        name: sales.productName ?? sales.ProductName ?? details.productName ?? "-",
        brand: sales.brand ?? sales.Brand ?? details.brand ?? "-",
        productType:
          sales.productType ?? sales.ProductType ?? details.productType ?? "Egyéb",
        description:
          sales.description ?? sales.productDescription ?? details.description ?? details.productDescription ?? "",
        imageUrl: sales.imageURL || details.productImageURL || details.imageURL || "",
        thumbnailUrl:
          sales.thumbnailURL ||
          sales.thumbnailUrl ||
          sales.productThumbnailURL ||
          sales.productThumbnailUrl ||
          details.thumbnailURL ||
          details.thumbnailUrl ||
          details.productThumbnailURL ||
          details.productThumbnailUrl ||
          "",
        unit: getUnit({ ...details, ...sales }),
        quantity,
      };
    })
    .filter((product) => product.quantity > 0)
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, "hu"));

  const totalByUnit = new Map();
  const byTypeAndUnit = new Map();

  for (const product of products) {
    totalByUnit.set(product.unit, (totalByUnit.get(product.unit) ?? 0) + product.quantity);
    const key = `${product.productType}\u0000${product.unit}`;
    const group = byTypeAndUnit.get(key) ?? {
      productType: product.productType,
      unit: product.unit,
      quantity: 0,
    };
    group.quantity += product.quantity;
    byTypeAndUnit.set(key, group);
  }

  return {
    products,
    catalog: Array.isArray(productRows) ? productRows : [],
    totalByUnit: [...totalByUnit].map(([unit, quantity]) => ({ unit, quantity })),
    byType: [...byTypeAndUnit.values()].sort(
      (a, b) => a.productType.localeCompare(b.productType, "hu") || a.unit.localeCompare(b.unit),
    ),
  };
}
