import { ResolveProductThumbnailUrl } from "../shared/ProductImage.js";
import { EscapeHtml } from "../shared/Html.js";
import { RequestExpirationCheck } from "./api/LandingApi.js";
import { RenderExpiredStockBadge } from "../shared/ExpiredStockBadge.js";

function InitializeUserData() {
  const userName = sessionStorage.getItem("userName");
  const roleName = sessionStorage.getItem("roleName");

  const brandName = document.getElementById("brand-name");
  brandName.replaceChildren(document.createTextNode(`Hello ${userName ?? ""}! `));

  const profileIcon = document.createElement("i");
  profileIcon.className = "bi bi-person-fill";
  profileIcon.style.cursor = "pointer";
  profileIcon.dataset.bsToggle = "modal";
  profileIcon.dataset.bsTarget = "#user-data-modal";
  brandName.appendChild(profileIcon);

  document.getElementById("user-name").textContent = userName;

  document.getElementById("role-name").textContent = roleName;
}

function InitializeExitButton() {
  const exitButton = document.getElementById("exit-app-button");

  exitButton?.addEventListener("click", () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("roleName");

    window.location.href = "../LoginPage/LoginPage.html";
  });
}

const pageButtons = [
  {
    requiredRoles: ["Admin", "Counter"],
    page: "../CounterPage/CounterPage.html",
    icon: "bi-shop-window",
    title: "Kassza mód",
  },
  {
    requiredRoles: ["Admin", "Storage"],
    page: "../AddStockPage/AddStockPage.html",
    icon: "bi-clipboard2-plus",
    title: "Áru felvétel",
  },
  {
    requiredRoles: ["Admin", "Storage", "Counter"],
    page: "../StockPanel/StockPanel.html",
    icon: "bi-box-seam",
    title: "Áru Panel",
  },
  {
    requiredRoles: ["Admin"],
    page: "../ProfilPanel/ProfilPanel.html",
    icon: "bi-people",
    title: "Profil Panel",
  },
  {
    requiredRoles: ["Admin"],
    page: "../StatisticsPanel/StatisticsPanel.html",
    icon: "bi-clipboard-data",
    title: "Statisztika Panel",
  },
  {
    requiredRoles: ["Admin"],
    page: "../AdminPanel/AdminPanel.html",
    icon: "bi-shield",
    title: "Admin Panel",
  },
];

function CreatePageButton(button) {
  const wrapper = document.createElement("div");

  wrapper.classList.add("col-12", "col-md-6");

  wrapper.innerHTML = `
    <div
      class="btn btn-outline-primary menu-btn w-100 d-flex align-items-center justify-content-center gap-3 border-3 rounded"
    >
      <i class="bi ${button.icon} fs-2"></i>
      <span class="fs-2 fw-bold">
        ${button.title}
      </span>
    </div>
  `;

  const buttonElement = wrapper.firstElementChild;

  buttonElement.addEventListener("click", () => {
    window.location.href = button.page;
  });

  return wrapper;
}

function InitializePageButtons() {
  const buttonContainer = document.getElementById("button-container");

  if (!buttonContainer) {
    return;
  }

  buttonContainer.innerHTML = "";

  const roleName = sessionStorage.getItem("roleName");

  pageButtons.forEach((button) => {
    if (!button.requiredRoles.includes(roleName)) {
      return;
    }

    const pageButton = CreatePageButton(button);

    buttonContainer.appendChild(pageButton);
  });
}

// EXPIRATION ALERT

let alertTimeout;
let alertAnimation;
let expiringElements = [];

function ShowExpiringProductAlert() {
  const alertElement = document.getElementById("expiration-alert");

  const progressElement = document.getElementById("expiration-alert-progress");

  clearTimeout(alertTimeout);
  cancelAnimationFrame(alertAnimation);

  alertElement.classList.remove("d-none");

  progressElement.style.transition = "none";
  progressElement.style.transform = "scaleX(1)";

  requestAnimationFrame(() => {
    progressElement.style.transition = "transform 10s linear";

    progressElement.style.transform = "scaleX(0)";
  });

  alertTimeout = setTimeout(() => {
    alertElement.classList.add("d-none");
  }, 10000);
}

async function ExpirationCheck() {
  try {
    const result = await RequestExpirationCheck();
    if (result?.isAnyExpiring && Array.isArray(result.expiringStocks)) {
      expiringElements = result.expiringStocks;
      ShowExpiringProductAlert();
    }
  } catch {
    // A háttérben futó lejáratellenőrzés hibája ne akadályozza a főmenü használatát.
  }
}

function FillExpiringProducts(products) {
  const tableBody = document.getElementById("expiring-products-table-body");

  const productCount = document.getElementById("expiring-products-count");

  tableBody.innerHTML = "";

  productCount.textContent = `${products.length} ${
    products.length === 1 ? "termék" : "termék"
  }`;

  products.forEach((product) => {
    const row = document.createElement("tr");

    const expirationDate = new Date(product.expirationDate);

    const formattedDate = expirationDate.toLocaleDateString("hu-HU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    row.innerHTML = `
      <td class="px-4">
        <div
          class="d-flex align-items-center justify-content-center bg-body-tertiary border rounded-3"
          style="width: 56px; height: 56px;"
        >
          <img
            data-product-image="true"
            src="${EscapeHtml(ResolveProductThumbnailUrl(product.thumbnailURL || product.thumbnailUrl || product.productThumbnailURL || product.productThumbnailUrl, product.imageURL || product.productImageURL || product.imageUrl))}"
            alt="${EscapeHtml(product.productName)}"
            loading="lazy"
            decoding="async"
            class="rounded-2"
            style="
              width: 48px;
              height: 48px;
              object-fit: contain;
            "
          />
        </div>
      </td>

      <td>
        <span class="fw-semibold">
          ${EscapeHtml(product.productName)} ${RenderExpiredStockBadge(product, "ms-1")}
        </span>
      </td>

      <td class="text-center">
        <span class="fw-semibold">
          ${EscapeHtml(product.quantity)}
        </span>
      </td>

      <td class="text-center">
        ${
          product.isDiscounted
            ? `
              <span class="badge rounded-pill bg-warning-subtle text-warning-emphasis border px-3 py-2">
                <i class="bi bi-tag-fill me-1"></i>
                Akciós
              </span>
            `
            : `
              <span class="badge rounded-pill bg-secondary-subtle text-secondary-emphasis border px-3 py-2">
                Normál ár
              </span>
            `
        }
      </td>

      <td class="text-center">
        <span class="badge rounded-pill bg-danger-subtle text-danger border px-3 py-2">
          <i class="bi bi-calendar-event me-1"></i>
          ${formattedDate}
        </span>
      </td>
    `;

    tableBody.appendChild(row);
  });

  const modal = new bootstrap.Modal(
    document.getElementById("expiring-products-modal"),
  );

  modal.show();
}

function InitializeExpirationAlert() {
  const alertElement = document.getElementById("expiration-alert");

  alertElement?.addEventListener("click", () => {
    clearTimeout(alertTimeout);
    cancelAnimationFrame(alertAnimation);

    alertElement.classList.add("d-none");

    FillExpiringProducts(expiringElements);
  });
}

function InitializePage() {
  InitializeUserData();
  InitializeExitButton();
  InitializePageButtons();
  InitializeExpirationAlert();
}

if (window.__pageAccessAllowed === true) {
  InitializePage();
  void ExpirationCheck();
}
