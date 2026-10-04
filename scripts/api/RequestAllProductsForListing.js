export default async function RequestAllProductsForListing() {
  const response = await fetch(`${window.config.API_URL}/Products/listing`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  const data = await response.json();

  return data;
}
