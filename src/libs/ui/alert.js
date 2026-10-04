/**
 * Shared notification component.
 *
 * Previously this markup and behaviour was copy-pasted into every page
 * (AddStockPage, CounterPage, LoginPage, ProfilPanel, StockPanel). It is now
 * defined once here; pages import `DisplayAlert` and `LoadingSpinner`.
 */

const ALERT_AUTO_CLOSE_MS = 3000;
const ALERT_FADE_MS = 150;

const ICONS = {
  success: "bi bi-check-circle-fill",
  danger: "bi bi-exclamation-circle-fill",
  warning: "bi bi-exclamation-triangle-fill",
  info: "bi bi-info-circle-fill",
};

/**
 * Maps an alert level to its Bootstrap icon class.
 *
 * @param {"success"|"danger"|"warning"|"info"} type
 * @returns {string}
 */
export function AlertIcon(type) {
  return ICONS[type] || ICONS.info;
}

/**
 * Shows a dismissible alert in the `#liveAlertPlaceholder` element.
 *
 * Any previously displayed alert is removed first, so only one is visible at
 * a time. The alert closes automatically after {@link ALERT_AUTO_CLOSE_MS}.
 *
 * @param {"success"|"danger"|"warning"|"info"} type
 * @param {string} message Message text (may contain HTML).
 */
export function DisplayAlert(type, message) {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");

  if (!alertPlaceholder) {
    return;
  }

  // Előző alert eltávolítása
  alertPlaceholder.innerHTML = "";

  const wrapper = document.createElement("div");

  wrapper.innerHTML = `
    <div
      class="alert modern-alert alert-${type} fade show"
      role="alert"
    >
      <div class="modern-alert-icon">
        <i class="${AlertIcon(type)}"></i>
      </div>

      <div class="modern-alert-message">
        ${message}
      </div>

      <button
        type="button"
        class="modern-alert-close"
        aria-label="Bezárás"
      >
        <i class="bi bi-x-lg"></i>
      </button>

      <div class="modern-alert-progress"></div>
    </div>
  `;

  alertPlaceholder.appendChild(wrapper);

  const alertElement = wrapper.querySelector(".modern-alert");
  const closeButton = wrapper.querySelector(".modern-alert-close");

  const closeAlert = () => {
    if (!alertElement || !alertElement.isConnected) {
      return;
    }

    alertElement.classList.remove("show");

    setTimeout(() => {
      if (alertElement.isConnected) {
        alertElement.remove();
      }
    }, ALERT_FADE_MS);
  };

  closeButton.addEventListener("click", closeAlert);

  // Automatikus bezárás
  setTimeout(() => {
    closeAlert();
  }, ALERT_AUTO_CLOSE_MS);
}

/**
 * Toggles the full-page loading overlay (`#spinning-overlay`).
 *
 * @param {boolean} isLoading
 */
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