export default async function SendCreateProductRequest(formData, sku) {
  const response = await fetch(`${window.config.API_URL}/Products/${sku}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (response.ok) {
    return true;
  }

  var errorMessage = await response.text();

  return errorMessage;
}
