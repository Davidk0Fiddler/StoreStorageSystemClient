export function DisplayProductTypeStatistics(statistics) {
  const totalElement = document.getElementById("all-producttypes-area");

  const activeElement = document.getElementById("all-active-producttypes-area");

  const inactiveElement = document.getElementById(
    "all-inactive-producttypes-area",
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
