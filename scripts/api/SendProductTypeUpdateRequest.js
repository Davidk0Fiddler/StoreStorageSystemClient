export default async function SendProductTypeUpdateRequest(requestBody) {
  const response = await fetch(
    `${window.config.API_URL}/ProductType/${requestBody.Id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
      body: JSON.stringify(requestBody),
    },
  );

  if (response.ok) {
    return true;
  }

  var errorMessage = await response.text();

  return errorMessage;
}
