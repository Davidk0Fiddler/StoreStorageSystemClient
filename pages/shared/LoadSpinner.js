export function LoadingSpinner(isLoading) {
  const spinningOverlay = document.getElementById("spinning-overlay");

  if (!spinningOverlay) {
    return;
  }

  if (isLoading) {
    spinningOverlay.classList.remove("d-none");
  } else {
    spinningOverlay.classList.add("d-none");
  }
}
