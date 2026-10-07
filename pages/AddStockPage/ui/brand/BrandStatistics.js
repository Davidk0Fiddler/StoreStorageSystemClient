export function DisplayBrandStatistics(statistics) {
  const totalElement = document.getElementById("all-brands-area");

  const activeElement = document.getElementById("all-active-brands-area");

  const inactiveElement = document.getElementById("all-inactive-brands-area");

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
