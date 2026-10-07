export function AlertIcon(type) {
  switch (type) {
    case "success":
      return "bi bi-check-circle-fill";

    case "danger":
      return "bi bi-exclamation-circle-fill";

    case "warning":
      return "bi bi-exclamation-triangle-fill";

    case "info":
      return "bi bi-info-circle-fill";

    default:
      return "bi bi-info-circle-fill";
  }
}

export async function DisplayAlert(type, message) {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");

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
    }, 150);
  };

  closeButton.addEventListener("click", closeAlert);

  setTimeout(() => {
    closeAlert();
  }, 3000);
}
