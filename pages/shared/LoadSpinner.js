export function LoadingSpinner(isLoading, message = "Betöltés…") {
  const spinningOverlay = document.getElementById("spinning-overlay");

  if (!spinningOverlay) {
    return;
  }

  if (isLoading) {
    spinningOverlay.classList.remove("d-none");
    const messageElement = document.getElementById("spinning-overlay-message");
    if (messageElement) messageElement.textContent = message;
  } else {
    spinningOverlay.classList.add("d-none");
  }
}
