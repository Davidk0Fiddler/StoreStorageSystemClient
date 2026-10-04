export default async function RequestAllUsers() {
  const response = await fetch(`${window.config.API_URL}/Users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  });

  const data = await response.json();

  return data;
}
