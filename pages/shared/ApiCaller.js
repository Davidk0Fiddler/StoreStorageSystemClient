export async function API_CALL(
  endpoint,
  method = "GET",
  data = null,
  lastURLIdentifier = null,
  isFormData = false,
) {
  const url = `${window.config.API_URL}/${endpoint}${
    lastURLIdentifier ? `/${lastURLIdentifier}` : ""
  }`;

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    },
  };

  if (data !== null && method !== "GET" && !isFormData) {
    options.body = JSON.stringify(data);
  } else if (data !== null && method !== "GET" && isFormData) {
    options.body = data;
    delete options.headers["Content-Type"];
  }

  const response = await fetch(url, options);

  const contentType = response.headers.get("content-type");

  let result = null;

  if (contentType?.includes("application/json")) {
    result = await response.json();
  } else if (response.status !== 204) {
    result = await response.text();
  }

  if (!response.ok) {
    console.error(`API call failed: ${response.status} - ${result}`);
    return {
      success: false,
      status: response.status,
      data: result,
    };
  }

  return {
    success: true,
    status: response.status,
    data: result,
  };
}
