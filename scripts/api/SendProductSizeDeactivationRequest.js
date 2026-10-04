export default async function SendProductSizeDeactivationRequest(
  productSizeId,
) {
  const response = await fetch(
    `${window.config.API_URL}/ProductSize/deactivate/${productSizeId}`,
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
