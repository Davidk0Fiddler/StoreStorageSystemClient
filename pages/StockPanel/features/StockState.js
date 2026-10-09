let currentlySelectedStock = null;
let stocks = [];

export function GetSelectedStock() {
  return currentlySelectedStock;
}

export function SetSelectedStock(stock) {
  currentlySelectedStock = stock;
}

export function ClearSelectedStock() {
  currentlySelectedStock = null;
}

export function GetStocks() {
  return stocks;
}

export function SetStocks(newStocks) {
  stocks = Array.isArray(newStocks) ? newStocks : [];
}

export function UpdateStockPriceInList(stockId, newPrice) {
  stocks = stocks.map((stock) => {
    if (stock.id === stockId || stock.stockId === stockId) {
      return {
        ...stock,
        currentPrice: newPrice,
        price: newPrice,
      };
    }

    return stock;
  });
}
