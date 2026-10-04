export default async function RequestAllStocks() {
  const response = await fetch(`${window.config.API_URL}/Stocks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  const data = await response.json();

  return data;
}
