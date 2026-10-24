import { AddStockAPIs } from "../../api/AddStockAPIs.js";
import { NormalizeApiList } from "../../../shared/NormalizeApiList.js";

import { GetBrandFilter, SetBrandFilter } from "./BrandState.js";

/*
 * Összes márka lekérése.
 */
export async function GetAllBrands() {
  const response = await AddStockAPIs.RequestAllBrands();

  if (!response.success) {
    return {
      success: false,
      error: response.data ?? "Hiba történt a márkák lekérésekor.",
    };
  }

  const brands = NormalizeApiList(response.data);
  if (!brands) return { success: false, error: "A backend nem márkalistát adott vissza." };

  return {
    success: true,
    data: brands,
  };
}

/*
 * Márkák szűrése az aktuális szűrő alapján.
 *
 * null  -> összes márka
 * true  -> aktív márkák
 * false -> inaktív márkák
 */
export function GetFilteredBrands(brands) {
  const filter = GetBrandFilter();

  if (filter === null) {
    return brands;
  }

  return brands.filter((brand) => brand.isActive === filter);
}

/*
 * Márkák statisztikáinak kiszámítása.
 */
export function GetBrandStatistics(brands) {
  let active = 0;
  let inactive = 0;

  for (const brand of brands) {
    if (brand.isActive) {
      active++;
    } else {
      inactive++;
    }
  }

  return {
    total: brands.length,
    active,
    inactive,
  };
}

/*
 * Aktuális márkaszűrő módosítása.
 */
export function ChangeBrandFilter(filter) {
  SetBrandFilter(filter);
}

/*
 * Márka aktiválása.
 */
export async function ActivateBrand(brandId) {
  const response = await AddStockAPIs.SendBrandActivationRequest(brandId);

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
 * Márka deaktiválása.
 */
export async function DeactivateBrand(brandId) {
  const response = await AddStockAPIs.SendBrandDeactivationRequest(brandId);

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
 * Új márka létrehozása.
 */
export async function CreateBrand(brandName) {
  const name = brandName.trim();

  if (!name) {
    return {
      success: false,
      error: "Adjon meg márkanevet!",
    };
  }

  const response = await AddStockAPIs.SendCreateBrandRequest({
    BrandName: name,
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

/*
 * Meglévő márka módosítása.
 */
export async function UpdateBrand(brandId, brandName) {
  const name = brandName.trim();

  if (!name) {
    return {
      success: false,
      error: "Adjon meg egy márkanevet!",
    };
  }

  const response = await AddStockAPIs.SendBrandUpdateRequest(brandId, {
    Id: brandId,
    BrandName: name,
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
