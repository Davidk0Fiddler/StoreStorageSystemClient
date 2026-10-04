export default async function SendProductTypeDeactivationRequest(
  productTypeId,
) {
  const response = await fetch(
    `${window.config.API_URL}/ProductType/deactivate/${productTypeId}`,
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
