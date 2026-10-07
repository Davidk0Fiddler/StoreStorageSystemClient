export function DisplayProductSizeStatistics(statistics) {
  const totalElement = document.getElementById("all-ProductSizes-area");

  const activeElement = document.getElementById("all-active-ProductSizes-area");

  const inactiveElement = document.getElementById(
    "all-inactive-ProductSizes-area",
  );

  if (totalElement) {
    totalElement.textContent = statistics.total;
  }

  if (activeElement) {
    activeElement.textContent = statistics.active;
  }

  if (inactiveElement) {
    inactiveElement.textContent = statistics.inactive;
  }
}
