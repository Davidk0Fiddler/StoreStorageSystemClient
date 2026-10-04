export default async function RequestProductByBarcode(barcode) {
  const response = await fetch(`${window.config.API_URL}/Products/${barcode}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();

  return data;
}
