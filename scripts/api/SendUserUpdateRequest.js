export default async function SendUserUpdateRequest(requestBody) {
  const response = await fetch(`${window.config.API_URL}/Users`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (response.ok) {
    return true;
  }

  var errorMessage = await response.text();

  return errorMessage;
}
