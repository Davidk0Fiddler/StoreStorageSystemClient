import { InitializeUserFeature } from "./features/UserFeature.js";

/*
 * Navigáció inicializálása
 */
function InitializeNavigation() {
  const backToMenuButton = document.getElementById("back-to-menu-button");

  backToMenuButton?.addEventListener("click", () => {
    window.location.href = "../LandingPage/LandingPage.html";
  });

  const backToMenuSidebarButton = document.getElementById(
    "back-to-menu-side-bar-button",
  );

  backToMenuSidebarButton?.addEventListener("click", () => {
    window.location.href = "../LandingPage/LandingPage.html";
  });
}

/*
 * Oldal inicializálása
 */
function InitializePage() {
  InitializeNavigation();
  InitializeUserFeature();
}

if (window.__pageAccessAllowed === true) InitializePage();
