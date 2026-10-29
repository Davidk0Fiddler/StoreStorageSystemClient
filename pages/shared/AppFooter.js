(() => {
  if (document.getElementById("app-attribution")) return;

  const footer = document.createElement("footer");
  footer.id = "app-attribution";
  footer.className = "app-attribution";
  footer.textContent = "Készítette: Hegedüs Dávid";
  footer.setAttribute("aria-label", "Az alkalmazás készítője");
  document.body.appendChild(footer);
})();
