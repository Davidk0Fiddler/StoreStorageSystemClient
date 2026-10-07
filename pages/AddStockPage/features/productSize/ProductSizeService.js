import { AddStockAPIs } from "../../api/AddStockAPIs.js";

import {
  GetProductSizeFilter,
  SetProductSizeFilter,
} from "./ProductSizeState.js";

/* Összes termékméret lekérése. */
export async function GetAllProductSizes() {
  const response = await AddStockAPIs.RequestAllProductSizes();

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Hiba történt a termékméretek lekérésekor.",
    };
  }

  return {
    success: true,
    data: response.data,
  };
}

/* Termékméretek szűrése az aktuális filter alapján. */
export function GetFilteredProductSizes(productSizes) {
  const filter = GetProductSizeFilter();

  if (filter === null) {
    return productSizes;
  }

  return productSizes.filter((productSize) => productSize.isActive === filter);
}

/* Termékméretek statisztikáinak kiszámítása. */
export function GetProductSizeStatistics(productSizes) {
  let active = 0;
  let inactive = 0;

  for (const productSize of productSizes) {
    if (productSize.isActive) {
      active++;
    } else {
      inactive++;
    }
  }

  return {
    total: productSizes.length,
    active,
    inactive,
  };
}

/* Aktuális termékméret-szűrő módosítása. */
export function ChangeProductSizeFilter(filter) {
  SetProductSizeFilter(filter);
}

/* Termékméret aktiválása. */
export async function ActivateProductSize(productSizeId) {
  const response =
    await AddStockAPIs.SendProductSizeActivationRequest(productSizeId);

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

/* Termékméret deaktiválása. */
export async function DeactivateProductSize(productSizeId) {
  const response =
    await AddStockAPIs.SendProductSizeDeactivationRequest(productSizeId);

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

/* Új termékméret létrehozása. */
export async function CreateProductSize(productSizeName) {
  const name = productSizeName.trim();

  if (!name) {
    return {
      success: false,
      error: "Adjon meg termékméretet!",
    };
  }

  const response = await AddStockAPIs.SendCreateProductSizeRequest({
    SizeName: name,
  });

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

/* Meglévő termékméret módosítása. */
export async function UpdateProductSize(productSizeId, productSizeName) {
  const name = productSizeName.trim();

  if (!name) {
    return {
      success: false,
      error: "Adjon meg termékméretet!",
    };
  }

  const response = await AddStockAPIs.SendProductSizeUpdateRequest(
    productSizeId,
    {
      Id: Number(productSizeId),
      SizeName: name,
    },
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
