export default async function RequestProductPurchase() {
  const response = await fetch(
    `${window.config.API_URL}/Statistics/productpurchase`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Product purchase backend error:", data);

    throw new Error(
      typeof data === "string" ? data : JSON.stringify(data.errors, null, 2),
    );
  }

  return data;
}
