import { authRepository } from "../../../libs/data-access/index.js";
import { DisplayAlert, LoadingSpinner, GoToPage } from "../../../libs/ui/index.js";

const { loginAndPersist } = authRepository;

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


// Login
document.getElementById("login-button").addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    LoadingSpinner(true);

    await loginAndPersist(usernameField.value.trim(), passwordField.value.trim());

    await DisplayAlert("success", `Sikeres bejelentkezés! Átirányítás...`);

    setTimeout(() => GoToPage("dashboard"), 3000);
  } catch (error) {
    DisplayAlert("danger", error.message);
    console.error(error);
  } finally {
    LoadingSpinner(false);
  }
});
