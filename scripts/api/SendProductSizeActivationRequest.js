export default async function SendProductSizeActivationRequest(productSizeId) {
  const response = await fetch(
    `${window.config.API_URL}/ProductSize/activate/${productSizeId}`,
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
