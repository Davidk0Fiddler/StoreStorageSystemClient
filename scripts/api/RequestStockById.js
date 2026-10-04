export default async function RequestStockById(id) {
  const response = await fetch(`${window.config.API_URL}/Stocks/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  const data = await response.json();

  return data;
}
