export default async function SendProductDeactivationRequest(productSKU) {
  const response = await fetch(
    `${window.config.API_URL}/Products/deactivate/${productSKU}`,
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
