export const SERVER_UNAVAILABLE_MESSAGE =
  "A szerver jelenleg nem érhető el. Ellenőrizze a hálózati kapcsolatot, majd próbálja újra.";

const networkErrorPattern =
  /^(failed to fetch|fetch failed|networkerror(?: when attempting to fetch resource)?|network request failed|load failed|the network connection was lost)$/i;

export function GetRequestFailureMessage(status, value) {
  const numericStatus = Number(status);
  if ([0, 502, 503, 504].includes(numericStatus)) {
    return SERVER_UNAVAILABLE_MESSAGE;
  }

  const message =
    typeof value === "string"
      ? value
      : value?.message ??
        value?.errorMessage ??
        value?.error ??
        value?.detail ??
        value?.title;

  return typeof message === "string" && networkErrorPattern.test(message.trim())
    ? SERVER_UNAVAILABLE_MESSAGE
    : value;
}

export function HandleUnauthorizedResponse(status) {
  if (Number(status) !== 401 || !sessionStorage.getItem("token")) return;
  if (window.__authRedirecting) return;

  window.__authRedirecting = true;
  window.__pageAccessAllowed = false;
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("userName");
  sessionStorage.removeItem("roleName");

  const loginUrl = document.documentElement.dataset.loginUrl;
  const destination = new URL(
    loginUrl || "../LoginPage/LoginPage.html",
    window.location.href,
  );
  destination.searchParams.set("reason", "session-expired");
  window.location.replace(destination.href);
}

export async function API_CALL(
  endpoint,
  method = "GET",
  data = null,
  lastURLIdentifier = null,
  isFormData = false,
  onUploadProgress = null,
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

  if (isFormData && typeof onUploadProgress === "function") {
    return new Promise((resolve) => {
      const request = new XMLHttpRequest();
      request.open(method, url, true);
      request.setRequestHeader("Authorization", options.headers.Authorization);
      request.upload.addEventListener("progress", (event) => {
        if (!event.lengthComputable) return;
        try {
          onUploadProgress({
            loaded: event.loaded,
            total: event.total,
            percent: Math.min(100, Math.round((event.loaded / event.total) * 100)),
          });
        } catch (error) {
          console.error("Upload progress callback failed:", error);
        }
      });
      request.addEventListener("load", () => {
        const contentType = request.getResponseHeader("content-type") ?? "";
        let result = null;
        if (request.status !== 204 && request.responseText) {
          if (contentType.toLowerCase().includes("json")) {
            try {
              result = JSON.parse(request.responseText);
            } catch {
              result = request.responseText;
            }
          } else {
            result = request.responseText;
          }
        }

        if (request.status < 200 || request.status >= 300) {
          HandleUnauthorizedResponse(request.status);
          resolve({
            success: false,
            status: request.status,
            data: GetRequestFailureMessage(request.status, result),
          });
          return;
        }
        resolve({ success: true, status: request.status, data: result });
      });
      request.addEventListener("error", () =>
        resolve({
          success: false,
          status: 0,
          data: GetRequestFailureMessage(0),
        }),
      );
      request.addEventListener("abort", () =>
        resolve({ success: false, status: 0, data: "A feltöltés megszakadt." }),
      );
      request.send(data);
    });
  }

  try {
    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type") ?? "";
    const body = response.status === 204 ? "" : await response.text();
    let result = body || null;
    if (body && contentType.toLowerCase().includes("json")) {
      try {
        result = JSON.parse(body);
      } catch {
        result = body;
      }
    }

    if (!response.ok) {
      HandleUnauthorizedResponse(response.status);
      return {
        success: false,
        status: response.status,
        data: GetRequestFailureMessage(response.status, result),
      };
    }

    return {
      success: true,
      status: response.status,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      status: 0,
      data: GetRequestFailureMessage(0, error),
    };
  }
}
