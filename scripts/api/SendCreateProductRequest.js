export default async function SendCreateProductRequest(formData) {
  const response = await fetch(`${window.config.API_URL}/Products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (response.ok) {
    return true;
  }

  var errorMessage = await response.text();

  return errorMessage;
}
