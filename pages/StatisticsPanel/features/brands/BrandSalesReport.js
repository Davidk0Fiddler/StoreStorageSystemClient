function getBrandName(value) {
  return String(value ?? "").trim();
}

function getBrandKey(value) {
  return getBrandName(value).toLocaleLowerCase("hu");
}

function unitTotals(products) {
  const totals = new Map();
  for (const product of products) {
    totals.set(product.unit, (totals.get(product.unit) ?? 0) + product.quantity);
  }
  return [...totals].map(([unit, quantity]) => ({ unit, quantity }));
}

export function BuildBrandSalesReport(productSalesReport, brandRows = []) {
  const brandMap = new Map();

  for (const row of Array.isArray(brandRows) ? brandRows : []) {
    const name = getBrandName(row.brandName ?? row.name ?? row.BrandName ?? row.Name);
    if (name) brandMap.set(getBrandKey(name), { name, products: [], score: 0 });
  }

  for (const row of productSalesReport.catalog ?? []) {
    const name = getBrandName(row.brand ?? row.brandName ?? row.Brand ?? row.BrandName);
    if (name && !brandMap.has(getBrandKey(name))) {
      brandMap.set(getBrandKey(name), { name, products: [], score: 0 });
    }
  }

  for (const product of productSalesReport.products ?? []) {
    const name = getBrandName(product.brand);
    if (!name || name === "-") continue;
    const key = getBrandKey(name);
    const brand = brandMap.get(key) ?? { name, products: [], score: 0 };
    brand.products.push(product);
    // Unit quantities are compared numerically for ranking; displayed totals retain units.
    brand.score += product.quantity;
    brandMap.set(key, brand);
  }

  const brands = [...brandMap.values()]
    .map((brand) => ({
      ...brand,
      products: [...brand.products].sort(
        (a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name, "hu"),
      ),
      totals: unitTotals(brand.products),
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "hu"));

  return {
    brands,
    topBrands: brands.filter((brand) => brand.score > 0).slice(0, 3),
    totalBrands: brands.length,
    totalByUnit: unitTotals(productSalesReport.products ?? []),
    totalScore: brands.reduce((sum, brand) => sum + brand.score, 0),
  };
}
