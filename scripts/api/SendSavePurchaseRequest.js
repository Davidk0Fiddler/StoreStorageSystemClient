export default async function SendSavePurchaseRequest(requestBody) {
  const response = await fetch(`${window.config.API_URL}/SavePurchase`, {
    method: "POST",
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
