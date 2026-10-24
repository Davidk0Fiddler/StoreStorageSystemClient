import { AddStockAPIs } from "../../api/AddStockAPIs.js";
import { NormalizeApiList } from "../../../shared/NormalizeApiList.js";

import {
  GetLoadedProducts,
  SetLoadedProducts,
  GetProductSearchFilter,
  GetProductSearchValue,
} from "./ProductState.js";

const PRODUCT_SEARCH_FIELDS = {
  nev: ["productName", "name"],
  vonalkod: ["barcode", "barCode", "barcodeNumber", "barCodeNumber", "productBarcode"],
  sku: ["sku", "productSKU", "productSku"],
  termektipus: ["productType", "productTypeName", "typeName", "type", "categoryName"],
  termekmeret: ["productSize", "productSizeName", "sizeName", "productUnit", "unit"],
  marka: ["brandName", "brand", "productBrand"],
};

const NESTED_SEARCH_VALUE_FIELDS = [
  "name",
  "productName",
  "brandName",
  "productTypeName",
  "categoryName",
  "type",
  "productSizeName",
  "unitName",
  "typeName",
  "sizeName",
  "value",
  "code",
];

function NormalizeSearchText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("hu-HU")
    .trim();
}

function GetSearchableProductValues(product, fields) {
  return fields.flatMap((field) => {
    const value = product?.[field];

    if (value === null || value === undefined) return [];

    if (typeof value === "object") {
      return NESTED_SEARCH_VALUE_FIELDS
        .map((nestedField) => value[nestedField])
        .filter((nestedValue) => nestedValue !== null && nestedValue !== undefined);
    }

    return [value];
  });
}

/*
 * Összes termék lekérése.
 */
export async function GetAllProducts() {
  const response = await AddStockAPIs.RequestAllProducts();

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Hiba történt a termékek lekérésekor.",
    };
  }

  const products = NormalizeApiList(response.data);
  if (!products) {
    return {
      success: false,
      error: "A backend nem terméklistát adott viss.",
    };
  }

  SetLoadedProducts(products);

  return {
    success: true,
    data: products,
  };
}

/*
 * Betöltött termékek lekérése.
 */
export function GetProducts() {
  return GetLoadedProducts();
}

/*
 * Termékek szűrése az aktuális keresés alapján.
 */
export function GetFilteredProducts() {
  const products = GetLoadedProducts();
  const filter = GetProductSearchFilter();
  const searchValue = NormalizeSearchText(GetProductSearchValue());
  const searchableFields = PRODUCT_SEARCH_FIELDS[filter];

  if (!searchableFields || !searchValue) {
    return products;
  }

  return products.filter((product) =>
    GetSearchableProductValues(product, searchableFields).some((value) =>
      NormalizeSearchText(value).includes(searchValue),
    ),
  );
}

/*
 * Kategória jellegű szűrőkhöz választható értékek.
 */
export function GetProductSearchOptions(filter) {
  const searchableFields = PRODUCT_SEARCH_FIELDS[filter];

  if (!searchableFields) return [];

  const uniqueValues = new Map();

  for (const product of GetLoadedProducts()) {
    for (const value of GetSearchableProductValues(product, searchableFields)) {
      const label = String(value ?? "").trim();
      const key = NormalizeSearchText(label);

      if (key && !uniqueValues.has(key)) {
        uniqueValues.set(key, label);
      }
    }
  }

  return [...uniqueValues.values()].sort((left, right) =>
    left.localeCompare(right, "hu-HU", { sensitivity: "base" }),
  );
}

/*
 * Termék aktiválása.
 */
export async function ActivateProduct(productSKU) {
  const response = await AddStockAPIs.SendProductActivationRequest(productSKU);

  if (!response.success) {
    return {
      success: false,
      error: response.data,
    };
  }

  return {
    success: true,
    data: response.data,
  };
}

/*
 * Termék deaktiválása.
 */
export async function DeactivateProduct(productSKU) {
  const response =
    await AddStockAPIs.SendProductDeactivationRequest(productSKU);

  if (!response.success) {
    return {
      success: false,
      error: response.data,
    };
  }

  return {
    success: true,
    data: response.data,
  };
}

/*
 * Termék lekérése SKU alapján.
 */
export async function GetProductBySKU(productSKU) {
  const response = await AddStockAPIs.RequestProductBySKU(productSKU);

  if (!response.success) {
    return {
      success: false,
      error: response.data,
    };
  }

  return {
    success: true,
    data: response.data,
  };
}

/*
 * Új termék létrehozása.
 */
export async function CreateProduct(formData, onProgress) {
  const response = await AddStockAPIs.SendCreateProductRequest(formData, onProgress);

  if (!response.success) {
    return {
      success: false,
      error: response.data,
    };
  }

  return {
    success: true,
    data: response.data,
  };
}

/*
 * Meglévő termék módosítása.
 */
export async function UpdateProduct(formData, productSKU, onProgress) {
  const response = await AddStockAPIs.SendProductUpdateRequest(
    productSKU,
    formData,
    onProgress,
  );

  if (!response.success) {
    return {
      success: false,
      error: response.data,
    };
  }

  return {
    success: true,
    data: response.data,
  };
}
