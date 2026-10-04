export default async function RequestTotalIncome() {
  const response = await fetch(
    `${window.config.API_URL}/Statistics/total-income`,
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
    console.error("Total income backend error:", data);

    throw new Error(
      typeof data === "string" ? data : JSON.stringify(data.errors, null, 2),
    );
  }

  return data;
}
