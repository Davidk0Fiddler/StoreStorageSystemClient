import RequestExpirationCheck from "../../scripts/api/RequestExpirationCheck.js";

document.getElementById("brand-name").innerHTML =
  `Hello ${sessionStorage.getItem("userName")}! <i class="bi bi-person-fill" style="cursor:pointer" data-bs-toggle="modal" data-bs-target="#user-data-modal"></i>`;

document.getElementById("user-name").textContent =
  sessionStorage.getItem("userName");

document.getElementById("role-name").textContent =
  sessionStorage.getItem("roleName");

document.getElementById("exit-app-button").addEventListener("click", () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("userName");
  sessionStorage.removeItem("roleName");

  GoToPage("../LoginPage/LoginPage.html");
});

function GoToPage(page) {
  window.location.href = page;
}

window.GoToPage = GoToPage;

const pageButtons = [
  {
    requiredRoles: ["Admin", "Counter"],
    pageButtonData: `<!-- Kassza mód gomb-->
          <div class="col-12 col-md-6" onclick="GoToPage('../CounterPage/CounterPage.html')">
            <div
              class="btn btn-outline-primary menu-btn w-100 d-flex align-items-center justify-content-center gap-3 border-3 rounded"
            >
              <i class="bi bi-shop-window fs-2"></i>
              <span class="fs-2 fw-bold">Kassza mód</span>
            </div>
          </div>`,
  },
  {
    requiredRoles: ["Admin", "Storage"],
    pageButtonData: `<!-- Áru felvétel-->
          <div class="col-12 col-md-6" onclick="GoToPage('../AddStockPage/AddStockPage.html')">
            <div
              class="btn btn-outline-primary menu-btn w-100 d-flex align-items-center justify-content-center gap-3 border-3 rounded"
            >
              <i class="bi bi-clipboard2-plus fs-2"></i>
              <span class="fs-2 fw-bold">Áru felvétel</span>
            </div>
          </div>`,
  },
  {
    requiredRoles: ["Admin", "Storage", "Counter"],
    pageButtonData: `<!-- Áru panel gomb-->
          <div class="col-12 col-md-6" onclick="GoToPage('../StockPanel/StockPanel.html')">
            <div
              class="btn btn-outline-primary menu-btn w-100 d-flex align-items-center justify-content-center gap-3 border-3 rounded"
            >
              <i class="bi bi-box-seam fs-2"></i>
              <span class="fs-2 fw-bold">Áru Panel</span>
            </div>
          </div>`,
  },
  {
    requiredRoles: ["Admin"],
    pageButtonData: `<!-- Felhasználó panel gomb-->
          <div class="col-12 col-md-6" onclick="GoToPage('../ProfilPanel/ProfilPanel.html')">
            <div
              class="btn btn-outline-primary menu-btn w-100 d-flex align-items-center justify-content-center gap-3 border-3 rounded"
            >
              <i class="bi bi-people fs-2"></i>
              <span class="fs-2 fw-bold">Profil Panel</span>
            </div>
          </div>`,
  },
  {
    requiredRoles: ["Admin"],
    pageButtonData: `<!-- Statisztika panel gomb-->
          <div class="col-12 col-md-6" onclick="GoToPage('../StatisticsPanel/StatisticsPanel.html')">
            <div
              class="btn btn-outline-primary menu-btn w-100 d-flex align-items-center justify-content-center gap-3 border-3 rounded"
            >
              <i class="bi bi-clipboard-data fs-2"></i>
              <span class="fs-2 fw-bold">Statisztika Panel</span>
            </div>
          </div>`,
  },
  {
    requiredRoles: ["Admin"],
    pageButtonData: `<!-- Admin panel gomb-->
          <div class="col-12 col-md-6" onclick="GoToPage('../AdminPanel/AdminPanel.html')">
            <div
              class="btn btn-outline-primary menu-btn w-100 d-flex align-items-center justify-content-center gap-3 border-3 rounded"
            >
              <i class="bi bi-shield fs-2"></i>
              <span class="fs-2 fw-bold">Admin Panel</span>
            </div>
          </div>`,
  },
];

const buttonContainer = document.getElementById("button-container");
buttonContainer.innerHTML = " ";
const roleName = sessionStorage.getItem("roleName");

pageButtons.forEach((button) => {
  if (button.requiredRoles.includes(roleName)) {
    buttonContainer.innerHTML += button.pageButtonData;
  }
});

// EXPIRATION ALERT

let alertTimeout;
let alertAnimation;

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

var expiringElements = [];

async function ExpirationCheck() {
  var result = await RequestExpirationCheck();

  console.log(result);

  if (result.isAnyExpiring) {
    expiringElements = result.expiringStocks;
    ShowExpiringProductAlert();
  }
}

document.getElementById("expiration-alert").addEventListener("click", () => {
  const alertElement = document.getElementById("expiration-alert");
  const progressElement = document.getElementById("expiration-alert-progress");
  clearTimeout(alertTimeout);
  cancelAnimationFrame(alertAnimation);
  alertElement.classList.add("d-none");

  FillExpiringProducts(expiringElements);
});

function FillExpiringProducts(products) {
  const tableBody = document.getElementById("expiring-products-table-body");

  const productCount = document.getElementById("expiring-products-count");

  tableBody.innerHTML = "";

  productCount.textContent = `${products.length} ${products.length === 1 ? "termék" : "termék"}`;

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

await ExpirationCheck();
