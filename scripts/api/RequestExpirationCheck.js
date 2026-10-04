export default async function RequestExpirationCheck() {
  const response = await fetch(
    `${window.config.API_URL}/Stocks/ExpirationCheck`,
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
