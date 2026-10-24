import { API_CALL } from "../../shared/ApiCaller.js";

export async function RequestExpirationCheck() {
  const response = await API_CALL("Stocks/ExpirationCheck", "GET");
  if (!response.success) {
    throw new Error("A lejáró készletek ellenőrzése sikertelen.");
  }
  return response.data;
}
