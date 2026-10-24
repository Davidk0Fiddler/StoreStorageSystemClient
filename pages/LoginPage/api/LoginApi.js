import { GetRequestFailureMessage } from "../../shared/ApiCaller.js";

export async function SendLoginRequest(username, password) {
  let response;
  try {
    response = await fetch(`${window.config.API_URL}/Login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  } catch (error) {
    throw new Error(GetRequestFailureMessage(0, error));
  }

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
    const message =
      typeof result === "string"
        ? result
        : result?.errorMessage ?? result?.message ?? result?.detail ?? result?.title;
    throw new Error(
      GetRequestFailureMessage(
        response.status,
        message || "Sikertelen bejelentkezés.",
      ),
    );
  }

  if (result && typeof result === "object") return result;
  throw new Error("A bejelentkezési válasz formátuma nem megfelelő.");
}
