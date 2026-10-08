import RequestExpirationCheck from "../../scripts/api/RequestExpirationCheck.js";

function InitializeUserData() {
  const userName = sessionStorage.getItem("userName");
  const roleName = sessionStorage.getItem("roleName");

  document.getElementById("brand-name").innerHTML =
    `Hello ${userName}! <i class="bi bi-person-fill" style="cursor:pointer" data-bs-toggle="modal" data-bs-target="#user-data-modal"></i>`;

  document.getElementById("user-name").textContent = userName;

  document.getElementById("role-name").textContent = roleName;
}

function InitializeExitButton() {
  const exitButton = document.getElementById("exit-app-button");

  exitButton?.addEventListener("click", () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("roleName");

    GoToPage("../LoginPage/LoginPage.html");
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
  const result = await RequestExpirationCheck();

  console.log(result);

  if (result.isAnyExpiring) {
    expiringElements = result.expiringStocks;

    ShowExpiringProductAlert();
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
            src="${product.imageUrl}"
            alt="${product.productName}"
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
          ${product.productName}
        </span>
      </td>

      <td class="text-center">
        <span class="fw-semibold">
          ${product.quantity}
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

InitializePage();
await ExpirationCheck();
