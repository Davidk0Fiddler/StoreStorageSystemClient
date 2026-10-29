let isCashRegisterMode = false;
let buyerAgeStatus = null;

export function GetIsCashRegisterMode() {
  return isCashRegisterMode;
}

export function SetIsCashRegisterMode(value) {
  isCashRegisterMode = value;
}

export function GetBuyerAgeStatus() {
  return buyerAgeStatus;
}

export function SetBuyerAgeStatus(value) {
  buyerAgeStatus = value;
}

export function ResetBuyerAgeStatus() {
  buyerAgeStatus = null;
}
