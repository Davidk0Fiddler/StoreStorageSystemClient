export default async function SendUpdateStockShopQuantityRequest(requestBody) {
  const response = await fetch(`${window.config.API_URL}/Stocks/shopquantity`, {
    method: "PUT",
    headers: {
      Authorization: "Bearer " + sessionStorage.getItem("token"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (response.ok) {
    return true;
  }

  return await response.text();
}
