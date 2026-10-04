export default async function SendBrandActivationRequest(brandId) {
  const response = await fetch(
    `${window.config.API_URL}/Brands/activate/${brandId}`,
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
