export default async function RequestAllStocksListing() {
  const response = await fetch(`${window.config.API_URL}/Stocks/listing`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  const data = await response.json();

  return data;
}
