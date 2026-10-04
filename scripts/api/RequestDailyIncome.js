export default async function RequestDailyIncome(date) {
  const response = await fetch(
    `${window.config.API_URL}/Statistics/daily-income?date=${date}`,
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
    console.error("Daily income backend error:", data);

    throw new Error(
      typeof data === "string" ? data : JSON.stringify(data.errors, null, 2),
    );
  }

  return data;
}
