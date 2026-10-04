export default async function SendingLoginRequest(username, password) {
  const response = await fetch(`${window.config.API_URL}/Login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!response.ok) {
    const errorMessage = await response.json();

    throw new Error(errorMessage.errorMessage || "Sikertelen bejelentkezés.");
  }

  return await response.json();
}
