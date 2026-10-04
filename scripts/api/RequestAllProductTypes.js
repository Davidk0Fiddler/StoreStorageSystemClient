export default async function RequestAllProductTypes() {
  const response = await fetch(`${window.config.API_URL}/ProductType`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  const data = await response.json();

  return data;
}
