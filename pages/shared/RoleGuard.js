(() => {
  window.__pageAccessAllowed = false;
  const page = document.documentElement;
  const allowedRoles = (page.dataset.requiredRoles ?? "")
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);

  const loginUrl = page.dataset.loginUrl ?? "../LoginPage/LoginPage.html";
  const unauthorizedUrl =
    page.dataset.unauthorizedUrl ?? "../LandingPage/LandingPage.html";

  if (allowedRoles.length === 0) {
    console.error("A védett oldalhoz nincs megadva engedélyezett szerepkör.");
    window.location.replace(loginUrl);
    return;
  }

  const token = sessionStorage.getItem("token");
  const roleName = sessionStorage.getItem("roleName");

  if (!token) {
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("roleName");
    window.location.replace(loginUrl);
    return;
  }

  if (!allowedRoles.includes(roleName)) {
    window.location.replace(roleName ? unauthorizedUrl : loginUrl);
    return;
  }

  window.__pageAccessAllowed = true;
})();
