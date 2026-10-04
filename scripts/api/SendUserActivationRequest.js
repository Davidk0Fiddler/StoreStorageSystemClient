export default async function SendUserActivationRequest(username) {
  const response = await fetch(
    `${window.config.API_URL}/Users/activate/${username}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    },
  );

  if (response.ok) {
    return true;
  }

  var errorMessage = await response.text();

  return errorMessage;
}
