import SendingLoginRequest from "../../scripts/api/SendLoginRequest.js";

const usernameField = document.getElementById("login-username-field");
const passwordField = document.getElementById("login-password-field");
const loginButton = document.getElementById("login-button");

const tooltipElement = document.querySelector('[data-bs-toggle="tooltip"]');

const togglePasswordButton = document.getElementById("toggle-password-button");

togglePasswordButton.addEventListener("click", () => {
  const icon = togglePasswordButton.querySelector("i");

  if (passwordField.type === "password") {
    passwordField.type = "text";

    icon.classList.remove("bi-eye");
    icon.classList.add("bi-eye-slash");
  } else {
    passwordField.type = "password";

    icon.classList.remove("bi-eye-slash");
    icon.classList.add("bi-eye");
  }
});

const tooltip = new bootstrap.Tooltip(tooltipElement);
document.addEventListener("DOMContentLoaded", () => {
  function validateFields() {
    const username = usernameField.value.trim();
    const password = passwordField.value.trim();

    if (username !== "" && password !== "") {
      loginButton.disabled = false;
      loginButton.classList.remove("btn-secondary");
      loginButton.classList.add("btn-primary");
      tooltip.disable();
    } else {
      loginButton.disabled = true;
      loginButton.classList.remove("btn-primary");
      loginButton.classList.add("btn-secondary");
      tooltip.enable();
    }
  }

  usernameField.addEventListener("input", validateFields);
  passwordField.addEventListener("input", validateFields);

  validateFields();
});

// Alert function

function AlertIcon(type) {
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

async function DisplayAlert(type, message) {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");

  // Korábbi alert eltávolítása
  alertPlaceholder.innerHTML = "";

  // Alert létrehozása
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

  // Alert hozzáadása a DOM-hoz
  alertPlaceholder.appendChild(wrapper);

  // Most már biztosan létezik az elem
  const alertElement = wrapper.querySelector(".modern-alert");
  const closeButton = wrapper.querySelector(".modern-alert-close");

  // Bezárás függvény
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

  // X gomb
  closeButton.addEventListener("click", closeAlert);

  // Automatikus bezárás 5 másodperc után
  setTimeout(() => {
    closeAlert();
  }, 3000);
}

function LoadingSpinner(isLoading) {
  const spinningOverlay = document.getElementById("spinning-overlay");
  if (isLoading) {
    spinningOverlay.classList.remove("d-none");
  } else {
    spinningOverlay.classList.add("d-none");
  }
}

// Login
document.getElementById("login-button").addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    LoadingSpinner(true);

    const response = await SendingLoginRequest(
      usernameField.value.trim(),
      passwordField.value.trim(),
    );

    sessionStorage.setItem("roleName", response.roleName);
    sessionStorage.setItem("token", response.token);
    sessionStorage.setItem("userName", response.userName);

    await DisplayAlert("success", `Sikeres bejelentkezés! Átirányítás...`);

    setTimeout(
      () => (window.location.href = "../LandingPage/LandingPage.html"),
      3000,
    );
  } catch (error) {
    DisplayAlert("danger", error.message);
    console.error(error);
  } finally {
    LoadingSpinner(false);
  }
});
