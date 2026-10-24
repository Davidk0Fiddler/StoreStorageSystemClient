import { StatisticsApi } from "../../api/StatisticsApi.js";

function quantityOf(product) {
  const value = Number(product.soldQuantity ?? product.totalPurchased ?? product.quantity ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function sumByUnit(products) {
  const totals = new Map();
  for (const product of products) {
    const unit = product.unit ?? "db";
    totals.set(unit, (totals.get(unit) ?? 0) + quantityOf(product));
  }
  return [...totals].map(([unit, quantity]) => ({ unit, quantity }));
}

function BuildBrandReport(data) {
  const rows = Array.isArray(data) ? data : data?.brands ?? [];
  const brands = rows.map((row) => {
    const products = (row.products ?? []).map((product) => ({
      sku: product.sku ?? product.SKU ?? "",
      name: product.productName ?? product.name ?? product.ProductName ?? "-",
      brand: row.brandName ?? row.name ?? "-",
      productType: product.productType ?? "Egyéb",
      description: product.description ?? product.productDescription ?? "",
      imageUrl: product.imageURL || product.imageUrl || "",
      thumbnailUrl: product.thumbnailURL || product.thumbnailUrl || product.productThumbnailURL || product.productThumbnailUrl || "",
      unit: product.unit ?? product.productSize ?? "db",
      quantity: quantityOf(product),
    })).sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, "hu"));
    const totals = row.totalsByUnit?.map((item) => ({
      unit: item.unit ?? "db",
      quantity: Number(item.quantity ?? item.totalPurchased ?? 0),
    })) ?? sumByUnit(products);
    const score = totals.reduce((sum, item) => sum + item.quantity, 0);
    return {
      id: row.brandId ?? row.id,
      name: row.brandName ?? row.name ?? row.BrandName ?? "Névtelen márka",
      products,
      totals,
      score,
    };
  }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "hu"));
  const totalByUnit = new Map();
  for (const brand of brands) {
    for (const total of brand.totals) totalByUnit.set(total.unit, (totalByUnit.get(total.unit) ?? 0) + total.quantity);
  }
  return {
    brands,
    topBrands: brands.filter((brand) => brand.score > 0).slice(0, 3),
    totalBrands: data?.totalBrands ?? brands.length,
    totalByUnit: [...totalByUnit].map(([unit, quantity]) => ({ unit, quantity })),
    totalScore: brands.reduce((sum, brand) => sum + brand.score, 0),
  };
}

export async function GetBrandSalesReport(from, to) {
  const response = await StatisticsApi.getBrandSales(from, to);
  if (!response.success) throw new Error("Nem sikerült lekérni a márkaeladásokat.");
  return BuildBrandReport(response.data);
}
