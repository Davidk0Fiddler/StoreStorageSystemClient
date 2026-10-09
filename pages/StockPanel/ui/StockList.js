import { CreateStockRow } from "./StockRow.js";

export function RenderStockList(stocks, onStockClick) {
  const stockTableBody = document.getElementById("stock-table-body");

  if (!stockTableBody) {
    console.error("Nem található a #stock-table-body elem.");
    return;
  }

  stockTableBody.innerHTML = "";

  stocks.forEach((stock) => {
    const row = CreateStockRow(stock, onStockClick);
    stockTableBody.appendChild(row);
  });
}
