(() => {
  window.__pageAccessAllowed = true;
  const page = document.documentElement;
  const allowedRoles = (page.dataset.requiredRoles ?? "")
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);

  if (allowedRoles.length === 0) return;

  const loginUrl = page.dataset.loginUrl ?? "../LoginPage/LoginPage.html";
  const unauthorizedUrl =
    page.dataset.unauthorizedUrl ?? "../LandingPage/LandingPage.html";
  const token = sessionStorage.getItem("token");
  const roleName = sessionStorage.getItem("roleName");

  if (!token) {
    window.__pageAccessAllowed = false;
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("roleName");
    window.location.replace(loginUrl);
    return;
  }

  if (!allowedRoles.includes(roleName)) {
    window.__pageAccessAllowed = false;
    window.location.replace(roleName ? unauthorizedUrl : loginUrl);
  }
})();
