export default async function RequestAllProductsForCashier() {
  const response = await fetch(
    `${window.config.API_URL}/GetProductsForCashier`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    },
  );

  const data = await response.json();

  return data;
}
