import {
  GetCurrentVAT,
  SetCurrentVAT,
  GetCurrentMargin,
  SetCurrentMargin,
} from "./StockState.js";

export function CalculateSellingPrice(importPrice) {
  if (!Number.isFinite(importPrice) || importPrice <= 0) {
    return null;
  }

  const margin = GetCurrentMargin();

  const vat = GetCurrentVAT();

  return Math.round(importPrice * (1 + margin / 100) * (1 + vat / 100));
}

export function CalculateMarginFromSellingPrice(importPrice, currentPrice) {
  if (
    !Number.isFinite(importPrice) ||
    importPrice <= 0 ||
    !Number.isFinite(currentPrice)
  ) {
    return null;
  }

  const vat = GetCurrentVAT();

  return (currentPrice / (importPrice * (1 + vat / 100)) - 1) * 100;
}

export function SetMargin(margin) {
  if (!Number.isFinite(margin)) {
    return;
  }

  SetCurrentMargin(margin);
}

export function SetVAT(vat) {
  if (!Number.isFinite(vat)) {
    return;
  }

  SetCurrentVAT(vat);
}

export function GetMargin() {
  return GetCurrentMargin();
}

export function GetVAT() {
  return GetCurrentVAT();
}
