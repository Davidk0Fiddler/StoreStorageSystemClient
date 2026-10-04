export default async function SendProductTypeActivationRequest(productTypeId) {
  const response = await fetch(
    `${window.config.API_URL}/ProductType/activate/${productTypeId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    },
  );

  if (response.ok) {
    return true;
  }

  var errorMessage = await response.text();

  return errorMessage;
}
