export default async function SendCreateProductTypeRequest(requestBody) {
  const response = await fetch(`${window.config.API_URL}/ProductType`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (response.ok) {
    return true;
  }

  var errorMessage = await response.text();

  return errorMessage;
}
