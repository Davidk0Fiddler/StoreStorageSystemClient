import { StatisticsApi } from "../../api/StatisticsApi.js";
import { BuildProductSalesReport } from "./ProductSalesReport.js";
import { NormalizeApiList } from "../../../shared/NormalizeApiList.js";

export async function GetProductSalesReport() {
  const [salesResponse, productsResponse] = await Promise.all([
    StatisticsApi.getProductSales(),
    StatisticsApi.getProducts(),
  ]);

  if (!salesResponse.success) {
    throw new Error("Nem sikerült lekérni az eladási adatokat.");
  }
  if (!productsResponse.success) {
    throw new Error("Nem sikerült lekérni a termékkatalógust.");
  }

  const salesRows = NormalizeApiList(salesResponse.data);
  const products = NormalizeApiList(productsResponse.data);
  if (!salesRows || !products) {
    throw new Error("A backend nem termékesítési listát adott vissza.");
  }

  return BuildProductSalesReport(salesRows, products);
}
