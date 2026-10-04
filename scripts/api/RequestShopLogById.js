export default async function RequestShopLogById(id) {
  const response = await fetch(`${window.config.API_URL}/Shoplogs/${id}`, {
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
