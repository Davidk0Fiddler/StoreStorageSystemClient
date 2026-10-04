export default async function RequestAllProductSizes() {
  const response = await fetch(`${window.config.API_URL}/ProductSize`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  const data = await response.json();

  return data;
}
