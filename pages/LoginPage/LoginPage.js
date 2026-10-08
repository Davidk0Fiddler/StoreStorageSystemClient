import SendingLoginRequest from "../../scripts/api/SendLoginRequest.js";

const usernameField = document.getElementById("login-username-field");

const passwordField = document.getElementById("login-password-field");

const loginButton = document.getElementById("login-button");

const togglePasswordButton = document.getElementById("toggle-password-button");

const tooltipElement = document.querySelector('[data-bs-toggle="tooltip"]');

const tooltip = new bootstrap.Tooltip(tooltipElement);

function ValidateFields() {
  const username = usernameField.value.trim();

  const password = passwordField.value.trim();

  const isValid = username !== "" && password !== "";

  loginButton.disabled = !isValid;

  loginButton.classList.toggle("btn-primary", isValid);

  loginButton.classList.toggle("btn-secondary", !isValid);

  if (isValid) {
    tooltip.disable();
  } else {
    tooltip.enable();
  }
}

function TogglePasswordVisibility() {
  const icon = togglePasswordButton.querySelector("i");

  const isPassword = passwordField.type === "password";

  passwordField.type = isPassword ? "text" : "password";

  icon.classList.toggle("bi-eye", !isPassword);

  icon.classList.toggle("bi-eye-slash", isPassword);
}

function GetAlertIcon(type) {
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

function DisplayAlert(type, message) {
  const alertPlaceholder = document.getElementById("liveAlertPlaceholder");

  alertPlaceholder.innerHTML = "";

  const wrapper = document.createElement("div");

  wrapper.innerHTML = `
    <div
      class="alert modern-alert alert-${type} fade show"
      role="alert"
    >
      <div class="modern-alert-icon">
        <i class="${GetAlertIcon(type)}"></i>
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

  setTimeout(closeAlert, 3000);
}

function SetLoadingState(isLoading) {
  const spinningOverlay = document.getElementById("spinning-overlay");

  spinningOverlay.classList.toggle("d-none", !isLoading);
}

async function HandleLogin(event) {
  event.preventDefault();

  try {
    SetLoadingState(true);

    const response = await SendingLoginRequest(
      usernameField.value.trim(),
      passwordField.value.trim(),
    );

    sessionStorage.setItem("roleName", response.roleName);

    sessionStorage.setItem("token", response.token);

    sessionStorage.setItem("userName", response.userName);

    DisplayAlert("success", "Sikeres bejelentkezés! Átirányítás...");

    setTimeout(() => {
      window.location.href = "../LandingPage/LandingPage.html";
    }, 3000);
  } catch (error) {
    DisplayAlert("danger", error.message);

    console.error(error);
  } finally {
    SetLoadingState(false);
  }
}

function InitializeEventListeners() {
  usernameField.addEventListener("input", ValidateFields);

  passwordField.addEventListener("input", ValidateFields);

  togglePasswordButton.addEventListener("click", TogglePasswordVisibility);

  loginButton.addEventListener("click", HandleLogin);
}

function InitializePage() {
  InitializeEventListeners();
  ValidateFields();
}

InitializePage();
