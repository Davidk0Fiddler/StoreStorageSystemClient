import { EscapeHtml } from "../../../shared/Html.js";

const content = document.getElementById("statistics-content");

export function SetActiveStatisticsNavigation(panelId) {
  document
    .querySelectorAll(".statistics-nav-item[data-panel]")
    .forEach((button) => {
      button.classList.toggle("active", button.dataset.panel === panelId);
    });
}

export function InitializeStatisticsNavigation(onPanelSelected) {
  document
    .querySelectorAll(".statistics-nav-item[data-panel]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        onPanelSelected(button.dataset.panel);
      });
    });
}

export function ShowStatisticsPanelLoading() {
  content.innerHTML = `
    <div class="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-body-secondary">
      <div class="spinner-border text-primary mb-3" role="status"></div>
      <div>Adatok betöltése...</div>
    </div>`;
}

export function ShowStatisticsPanelError(message) {
  content.innerHTML = `
    <div class="container-fluid">
      <div class="alert alert-danger rounded-4 shadow-sm">
        <i class="bi bi-exclamation-triangle me-2"></i>${EscapeHtml(message)}
      </div>
    </div>`;
}

export function MountStatisticsPanel(html) {
  content.innerHTML = html;
}
