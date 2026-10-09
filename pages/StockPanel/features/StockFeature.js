import { GetAllStocks } from "./StockService.js";
import { SetStocks, GetStocks } from "./StockState.js";

export async function LoadStocks() {
  const spinningOverlay = document.getElementById("spinning-overlay");

  spinningOverlay?.classList.remove("d-none");

  try {
    const stocks = await GetAllStocks();

    if (stocks === null) {
      return null;
    }

    SetStocks(stocks);

    return stocks;
  } catch (error) {
    console.error("Készlet betöltése sikertelen:", error);
    return null;
  } finally {
    spinningOverlay?.classList.add("d-none");
  }
}

export function FilterStocks(filterType, searchValue) {
  const stocks = GetStocks();
  const search = (searchValue ?? "").trim().toLocaleLowerCase("hu-HU");

  if (!search) {
    return stocks;
  }

  const getProduct = (stock) => stock.product ?? stock;

  const getValue = (stock, property) => {
    const value = getProduct(stock)?.[property];
    return String(value ?? "").toLocaleLowerCase("hu-HU");
  };

  const filterProperties = {
    nev: "productName",
    vonalkod: "barcode",
    sku: "sku",
    termektipus: "productType",
    termekmeret: "productSize",
    marka: "brand",
  };

  const property = filterProperties[filterType];

  if (!property) {
    return stocks;
  }

  return stocks.filter((stock) => getValue(stock, property).includes(search));
}
