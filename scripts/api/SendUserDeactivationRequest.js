export default async function SendUserDeactivationRequest(username) {
  const response = await fetch(
    `${window.config.API_URL}/Users/deactivate/${username}`,
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
