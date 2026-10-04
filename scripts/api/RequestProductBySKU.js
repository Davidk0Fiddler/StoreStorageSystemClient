export default async function RequestProductBySKU(sku) {
  const response = await fetch(`${window.config.API_URL}/Products/sku/${sku}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  }

  var errorMessage = await response.text();

  return errorMessage;
}
