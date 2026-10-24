import { AddStockAPIs } from "../../api/AddStockAPIs.js";
import { NormalizeApiList } from "../../../shared/NormalizeApiList.js";

import {
  GetProductTypeFilter,
  SetProductTypeFilter,
} from "./ProductTypeState.js";

/* Összes terméktípus lekérése. */
export async function GetAllProductTypes() {
  const response = await AddStockAPIs.RequestAllProductTypes();

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Hiba történt a terméktípusok lekérésekor.",
    };
  }

  const productTypes = NormalizeApiList(response.data);
  if (!productTypes) return { success: false, error: "A backend nem terméktípus-listát adott vissza." };

  return {
    success: true,
    data: productTypes,
  };
}

/* Terméktípusok szűrése az aktuális filter alapján. */
export function GetFilteredProductTypes(productTypes) {
  const filter = GetProductTypeFilter();

  if (filter === null) {
    return productTypes;
  }

  return productTypes.filter((productType) => productType.isActive === filter);
}

/* Terméktípusok statisztikáinak kiszámítása. */
export function GetProductTypeStatistics(productTypes) {
  let active = 0;
  let inactive = 0;

  for (const productType of productTypes) {
    if (productType.isActive) {
      active++;
    } else {
      inactive++;
    }
  }

  return {
    total: productTypes.length,
    active,
    inactive,
  };
}

/* Aktuális terméktípus-szűrő módosítása. */
export function ChangeProductTypeFilter(filter) {
  SetProductTypeFilter(filter);
}

/* Terméktípus aktiválása. */
export async function ActivateProductType(productTypeId) {
  const response =
    await AddStockAPIs.SendProductTypeActivationRequest(productTypeId);

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

/* Terméktípus deaktiválása. */
export async function DeactivateProductType(productTypeId) {
  const response =
    await AddStockAPIs.SendProductTypeDeactivationRequest(productTypeId);

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

/* Új terméktípus létrehozása. */
export async function CreateProductType(productTypeName) {
  const name = productTypeName.trim();

  if (!name) {
    return {
      success: false,
      error: "Adjon meg terméktípust!",
    };
  }

  const response = await AddStockAPIs.SendCreateProductTypeRequest({
    TypeName: name,
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

/* Meglévő terméktípus módosítása. */
export async function UpdateProductType(productTypeId, productTypeName) {
  const name = productTypeName.trim();

  if (!name) {
    return {
      success: false,
      error: "Adjon meg terméktípust!",
    };
  }

  const response = await AddStockAPIs.SendProductTypeUpdateRequest(
    productTypeId,
    {
      Id: Number(productTypeId),
      TypeName: name,
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
