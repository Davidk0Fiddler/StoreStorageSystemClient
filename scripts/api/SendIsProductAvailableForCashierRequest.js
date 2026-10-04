export default async function SendIsProductAvailableForCashierRequest(
  requestBody,
) {
  const response = await fetch(
    `${window.config.API_URL}/IsProductAvailableForCashier`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(requestBody),
    },
  );

  if (response.ok) {
    return await response.json();
  }

  const errorMessage = await response.text();

  return errorMessage;
}
