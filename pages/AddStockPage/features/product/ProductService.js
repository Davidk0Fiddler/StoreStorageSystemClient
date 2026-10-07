import { AddStockAPIs } from "../../api/AddStockAPIs.js";

import {
  GetLoadedProducts,
  SetLoadedProducts,
  GetProductSearchFilter,
  GetProductSearchValue,
} from "./ProductState.js";

/*
 * Összes termék lekérése.
 */
export async function GetAllProducts() {
  const response = await AddStockAPIs.RequestAllProductsForListing();

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Hiba történt a termékek lekérésekor.",
    };
  }

  SetLoadedProducts(response.data);

  return {
    success: true,
    data: response.data,
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
  const searchValue = GetProductSearchValue();

  if (!filter || !searchValue) {
    return products;
  }

  switch (filter) {
    case "nev":
      return products.filter((product) =>
        product.productName?.toLowerCase().includes(searchValue),
      );

    case "vonalkod":
      return products.filter((product) =>
        product.barcode?.toLowerCase().includes(searchValue),
      );

    case "sku":
      return products.filter((product) =>
        product.sku?.toLowerCase().includes(searchValue),
      );

    case "termektipus":
      return products.filter((product) =>
        product.productType?.toLowerCase().includes(searchValue),
      );

    case "termekmeret":
      return products.filter((product) =>
        product.productSize?.toLowerCase().includes(searchValue),
      );

    case "marka":
      return products.filter((product) =>
        product.brand?.toLowerCase().includes(searchValue),
      );

    default:
      return products;
  }
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
export async function CreateProduct(formData) {
  const response = await AddStockAPIs.SendCreateProductRequest(formData);

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
export async function UpdateProduct(formData, productSKU) {
  const response = await AddStockAPIs.SendProductUpdateRequest(
    productSKU,
    formData,
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
