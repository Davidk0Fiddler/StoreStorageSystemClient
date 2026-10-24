import {
  InitializeCashier,
  OpenCashRegister,
  OpenProductSearch,
} from "./features/cashier/CashierFeature.js";

function InitializePageEvents() {
  const backToMenuButton = document.getElementById("back-to-menu-btn");

  backToMenuButton?.addEventListener("click", () => {
    window.location.href = "../LandingPage/LandingPage.html";
  });

  const openProductSearchButton = document.getElementById(
    "open-product-search-btn",
  );

  openProductSearchButton?.addEventListener("click", async () => {
    await OpenProductSearch();
  });

  const openCashRegisterButton = document.getElementById(
    "open-cash-register-btn",
  );

  openCashRegisterButton?.addEventListener("click", async () => {
    await OpenCashRegister();
  });
}

if (window.__pageAccessAllowed === true) {
  InitializePageEvents();
  InitializeCashier();
}
