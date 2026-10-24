import { StatisticsApi } from "../../api/StatisticsApi.js";

function fieldOrNull(row, ...keys) {
  if (!row || typeof row !== "object") return null;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
  }
  const normalizedKeys = new Set(keys.map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, "")));
  const match = Object.keys(row).find((key) => normalizedKeys.has(key.toLowerCase().replace(/[^a-z0-9]/g, "")));
  if (match !== undefined) return row[match];
  return null;
}

function amountOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

function rateOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const rate = Number(String(value).replace("%", "").trim());
  return Number.isFinite(rate) ? rate : null;
}

export async function GetVatReport(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  const from = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
  const to = `${year}-${String(monthNumber).padStart(2, "0")}-${String(new Date(year, monthNumber, 0).getDate()).padStart(2, "0")}`;
  const [response, salesResponse, productsResponse, stocksResponse] = await Promise.all([
    StatisticsApi.getVatReport(from, to),
    StatisticsApi.getProductSales(from, to),
    StatisticsApi.getProducts(),
    StatisticsApi.getStocks(),
  ]);
  if (!response.success) throw new Error("Az ÁFA-riport lekérése sikertelen.");
  const data = response.data?.data ?? response.data ?? {};
  const rowsFrom = (payload) => {
    if (Array.isArray(payload)) return payload;
    for (const key of ["items", "products", "data", "result", "value", "values", "records", "rows", "$values"]) {
      if (Array.isArray(payload?.[key])) return payload[key];
      const nested = payload?.[key];
      if (nested && typeof nested === "object") {
        const rows = rowsFrom(nested);
        if (rows.length > 0) return rows;
      }
    }
    for (const nested of Object.values(payload ?? {})) {
      if (Array.isArray(nested)) return nested;
      if (nested && typeof nested === "object") {
        const rows = rowsFrom(nested);
        if (rows.length > 0) return rows;
      }
    }
    return [];
  };
  const salesRows = rowsFrom(salesResponse.data);
  const productRows = rowsFrom(productsResponse.data);
  const stockRows = rowsFrom(stocksResponse.data);
  const productsBySku = new Map(productRows.map((product) => [
    String(product.sku ?? product.SKU ?? ""),
    product,
  ]));
  const stocksBySku = new Map();
  for (const stock of stockRows) {
    const product = stock.product ?? stock;
    const sku = String(product.sku ?? product.SKU ?? "");
    const importPrice = amountOrNull(stock.importPrice ?? stock.ImportPrice ?? product.importPrice ?? product.ImportPrice);
    if (!sku || importPrice === null) continue;
    const rawWeight = Number(stock.originalQuantity ?? stock.quantity ?? stock.Quantity ?? 0);
    const weight = Number.isFinite(rawWeight) && rawWeight > 0 ? rawWeight : 1;
    const aggregate = stocksBySku.get(sku) ?? { weightedCost: 0, weight: 0 };
    aggregate.weightedCost += importPrice * weight;
    aggregate.weight += weight;
    stocksBySku.set(sku, aggregate);
  }

  let soldGoodsExpense = 0;
  let refundableDepositExpense = 0;
  let expenseDataComplete = salesResponse.success;
  let reportedProfit = 0;
  let profitDataComplete = salesResponse.success && salesRows.length > 0;
  for (const sale of salesRows) {
    const saleProfit = amountOrNull(sale.profit ?? sale.Profit);
    if (saleProfit === null) profitDataComplete = false;
    else reportedProfit += saleProfit;

    const sku = String(sale.sku ?? sale.SKU ?? "");
    const product = productsBySku.get(sku) ?? sale;
    const quantity = amountOrNull(sale.totalPurchased ?? sale.soldQuantity ?? sale.quantity ?? sale.Quantity);
    const stockCost = stocksBySku.get(sku);
    const unitCost = amountOrNull(sale.importPrice ?? sale.ImportPrice ?? sale.purchasePrice ?? sale.unitCost)
      ?? amountOrNull(product.importPrice ?? product.ImportPrice)
      ?? (stockCost?.weight ? stockCost.weightedCost / stockCost.weight : null);
    const hasDepositValue = product.hasDeposit ?? product.HasDeposit ?? sale.hasDeposit ?? sale.HasDeposit;
    const hasDeposit = hasDepositValue === true || hasDepositValue === 1 || String(hasDepositValue).toLowerCase() === "true";
    const amountValue = product.depositAmount ?? product.DepositAmount ?? sale.depositAmount ?? sale.DepositAmount;
    const amount = amountValue === null || amountValue === undefined ? NaN : Number(amountValue);
    if (quantity === null || !Number.isFinite(quantity)) {
      expenseDataComplete = false;
      continue;
    }
    if ((hasDeposit || Number.isFinite(amount) && amount > 0) && Number.isFinite(amount)) {
      refundableDepositExpense += amount * quantity;
    }
    if (unitCost === null) {
      expenseDataComplete = false;
      continue;
    }
    soldGoodsExpense += unitCost * quantity;
  }
  const rates = (data.vatByRate ?? data.rates ?? []).map((item) => {
    const quantity = amountOrNull(fieldOrNull(item, "soldQuantity", "totalPurchased", "quantity", "salesQuantity"));
    const unit = String(fieldOrNull(item, "unit", "productSize") ?? "db").toLowerCase();
    const quantityByUnit = fieldOrNull(item, "salesQuantityByUnit", "soldQuantities") ?? {};
    return {
      rate: rateOrNull(fieldOrNull(item, "rate", "vatRate", "varRate", "vatPercentage", "vatPercent", "taxRate")),
      salesVatAmount: amountOrNull(fieldOrNull(item, "salesVatAmount", "outputVat", "salesVat")),
      salesNetAmount: amountOrNull(fieldOrNull(item, "salesNetAmount", "netRevenue")),
      salesGrossAmount: amountOrNull(fieldOrNull(item, "salesGrossAmount", "grossRevenue")),
      purchaseNetAmount: amountOrNull(fieldOrNull(item, "purchaseNetAmount")),
      soldQuantities: Object.keys(quantityByUnit).length > 0
        ? Object.fromEntries(Object.entries(quantityByUnit).map(([key, value]) => [String(key).toLowerCase(), amountOrNull(value) ?? 0]))
        : quantity === null ? {} : { [unit]: quantity },
    };
  });
  const ratesByValue = new Map(rates.map((item) => [String(Number(item.rate)), item]));
  const salesQuantityGroups = new Set();
  const depositQuantitiesByUnit = {};
  let depositSalesAmount = 0;
  for (const sale of salesRows) {
    const sku = String(sale.sku ?? sale.SKU ?? "");
    const product = productsBySku.get(sku) ?? sale;
    const quantity = amountOrNull(fieldOrNull(sale, "totalPurchased", "soldQuantity", "quantity")) ?? 0;
    const depositAmount = amountOrNull(fieldOrNull(product, "depositAmount") ?? fieldOrNull(sale, "depositAmount"));
    if (depositAmount !== null && depositAmount > 0) depositSalesAmount += depositAmount * quantity;
    const rateValue = fieldOrNull(sale, "vatRate", "varRate", "vatPercentage", "vatPercent", "taxRate", "vat")
      ?? fieldOrNull(sale.vat ?? sale.Vat, "rate", "value")
      ?? fieldOrNull(product, "vatRate", "varRate", "vatPercentage", "vatPercent", "taxRate", "vat")
      ?? fieldOrNull(product.vat ?? product.Vat, "rate", "value");
    const numericRate = rateOrNull(rateValue);
    const unit = String(fieldOrNull(sale, "unit", "productSize") ?? fieldOrNull(product, "unit", "productSize") ?? "db").toLowerCase();
    if (depositAmount !== null && depositAmount > 0 && numericRate !== 0) {
      depositQuantitiesByUnit[unit] = (depositQuantitiesByUnit[unit] ?? 0) + quantity;
    }
    if (numericRate === null) continue;
    const rateKey = String(numericRate);
    let rate = ratesByValue.get(rateKey);
    if (!rate) {
      rate = { rate: numericRate, salesVatAmount: 0, salesNetAmount: null, salesGrossAmount: 0, purchaseNetAmount: null, soldQuantities: {} };
      rates.push(rate);
      ratesByValue.set(rateKey, rate);
    }
    const quantityGroup = `${rateKey}:${unit}`;
    if (!salesQuantityGroups.has(quantityGroup)) {
      rate.soldQuantities[unit] = 0;
      salesQuantityGroups.add(quantityGroup);
    }
    rate.soldQuantities[unit] = (rate.soldQuantities[unit] ?? 0) + quantity;
  }
  if (depositSalesAmount > 0) {
    let zeroRate = ratesByValue.get("0");
    if (!zeroRate) {
      zeroRate = { rate: 0, salesVatAmount: 0, salesNetAmount: null, salesGrossAmount: 0, purchaseNetAmount: null, soldQuantities: {} };
      rates.push(zeroRate);
      ratesByValue.set("0", zeroRate);
    }
    zeroRate.salesGrossAmount = (zeroRate.salesGrossAmount ?? 0) + depositSalesAmount;
    for (const [unit, quantity] of Object.entries(depositQuantitiesByUnit)) {
      zeroRate.soldQuantities[unit] = (zeroRate.soldQuantities[unit] ?? 0) + quantity;
    }
  }
  const grossRevenue = amountOrNull(data.grossRevenue)
    ?? (rates.length > 0 && rates.every((item) => item.salesGrossAmount !== null)
      ? rates.reduce((total, item) => total + item.salesGrossAmount, 0)
      : null);
  const purchaseNetAmount = amountOrNull(data.purchaseNetAmount)
    ?? (rates.length > 0 && rates.every((item) => item.purchaseNetAmount !== null)
      ? rates.reduce((total, item) => total + item.purchaseNetAmount, 0)
      : null);
  const outputVat = amountOrNull(data.outputVat)
    ?? (rates.length > 0 && rates.every((item) => item.salesVatAmount !== null)
      ? rates.reduce((total, item) => total + item.salesVatAmount, 0)
      : rates.length > 0
        ? rates.reduce((total, item) => total + (item.salesVatAmount ?? 0), 0)
        : 0);
  const costOfGoods = expenseDataComplete
    ? soldGoodsExpense
    : purchaseNetAmount ?? soldGoodsExpense;
  const grossProfit = profitDataComplete
    ? reportedProfit
    : (grossRevenue ?? 0) - outputVat - costOfGoods - refundableDepositExpense;
  const expenseAmount = grossProfit === null
    ? costOfGoods + refundableDepositExpense
    : (grossRevenue ?? 0) - outputVat - grossProfit;
  return {
    grossRevenue: grossRevenue ?? 0,
    outputVat,
    expenseAmount,
    grossProfit,
    rates,
    dailyTotals: data.dailyTotals ?? [],
  };
}
