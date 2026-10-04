import RequestAllUsers from "../../scripts/api/RequestAllUsers.js";
import SendCreateUserRequest from "../../scripts/api/SendCreateUserRequest.js";
import SendUserActivationRequest from "../../scripts/api/SendUserActivationRequest.js";
import SendUserDeactivationRequest from "../../scripts/api/SendUserDeactivationRequest.js";
import SendUserUpdateRequest from "../../scripts/api/SendUserUpdateRequest.js";

var currentUserFilter = " ";
// Back to main menu buttons

document.getElementById("back-to-menu-button").addEventListener("click", () => {
  window.location.href = "../LandingPage/LandingPage.html";
});

document
  .getElementById("back-to-menu-side-bar-button")
  .addEventListener("click", () => {
    window.location.href = "../LandingPage/LandingPage.html";
  });

// User Panel buttons

function FillUsers(userList) {
  const usersContainer = document.getElementById("users-container");
  usersContainer.innerHTML = " ";

  function StatusToggleReturner(status, username) {
    if (status) {
      return `
    <button class="btn btn-success p-2 col-6  fs-6" onclick="Deactivation('${username}')">
     <i class="bi bi-toggle-on" style="cursor: pointer"></i>
     Aktív
    </button>`;
    } else {
      return `
      <button class="btn btn-danger p-2 col-6  fs-6" onclick="Activation('${username}')">
        <i class="bi bi-toggle-off" style="cursor: pointer"></i>
        Inaktív
      </button>`;
    }
  }

  userList.forEach((user) => {
    usersContainer.innerHTML += `
    <div class="card user-card col-12 col-md-5 col-lg-3 m-2 border-0 shadow-sm">
    <div class="card-body p-4">

        <!-- Fejléc -->
        <div class="d-flex align-items-center mb-4">
            <div class="info-icon">
                <i class="bi bi-person-fill"></i>
            </div>

            <div class="overflow-hidden">
                <div class="text-muted small">Felhasználó</div>
                <div class="fw-semibold text-truncate">
                    ${user.userName}
                </div>
            </div>
        </div>

        <!-- Információk -->
        <div class="user-info">

            <div class="info-row">
                <div class="info-icon">
                    <i class="bi bi-shield-check"></i>
                </div>

                <div>
                    <div class="text-muted small">Jogosultságkör</div>
                    <div class="fw-semibold">
                        ${user.roleName}
                    </div>
                </div>
            </div>

            <div class="info-row">
                <div class="info-icon">
                    <i class="bi bi-calendar3"></i>
                </div>

                <div>
                    <div class="text-muted small">Létrehozás ideje</div>
                    <div class="fw-semibold">
                        ${new Date(user.createdAt).toLocaleString("hu-HU")}
                    </div>
                </div>
            </div>

        </div>

        <!-- Műveletek -->
        <div class="d-flex gap-2 mt-4">

            <button
                class="btn btn-light border flex-grow-1"
                onclick="OpenUserUpdateModal('${user.userName}')">

                <i class="bi bi-pencil me-1"></i>
                Módosítás
            </button>

            ${StatusToggleReturner(user.isActive, user.userName)}

        </div>

    </div>
</div>
  `;
  });
}

async function LoadUsers() {
  const users = await RequestAllUsers();

  document.getElementById("profile-count").textContent = users.length;
  document.getElementById("admin-count").textContent = users.filter(
    (u) => u.roleName == "Admin",
  ).length;
  document.getElementById("counter-count").textContent = users.filter(
    (u) => u.roleName == "Counter",
  ).length;
  document.getElementById("storage-count").textContent = users.filter(
    (u) => u.roleName == "Storage",
  ).length;

  return users;
}

const mainContainer = document.getElementById("main-container");
const panelLabel = document.getElementById("panel-label");

let selectedUserName = null;
async function ProfilPanel() {
  mainContainer.innerHTML = `
    <div class="profile-filter-bar">

      <div
        class="profile-filter active"
        id="all-profiles-count-filter-button"
      >
        <div class="filter-icon">
          <i class="bi bi-people"></i>
        </div>

        <div class="filter-content">
          <span class="filter-label">Összes profil</span>
          <span id="profile-count" class="filter-count">0</span>
        </div>
      </div>


      <div
        class="profile-filter"
        id="all-admins-count-filter-button"
      >
        <div class="filter-icon">
          <i class="bi bi-shield-lock"></i>
        </div>

        <div class="filter-content">
          <span class="filter-label">Adminisztrátorok</span>
          <span id="admin-count" class="filter-count">0</span>
        </div>
      </div>


      <div
        class="profile-filter"
        id="all-counters-count-filter-button"
      >
        <div class="filter-icon">
          <i class="bi bi-shop"></i>
        </div>

        <div class="filter-content">
          <span class="filter-label">Kassza profilok</span>
          <span id="counter-count" class="filter-count">0</span>
        </div>
      </div>


      <div
        class="profile-filter"
        id="all-storages-count-filter-button"
      >
        <div class="filter-icon">
          <i class="bi bi-box-seam"></i>
        </div>

        <div class="filter-content">
          <span class="filter-label">Raktár profilok</span>
          <span id="storage-count" class="filter-count">0</span>
        </div>
      </div>

    </div>


    <div
      class="row text-center p-1 align-items-center d-flex justify-content-evenly"
      id="users-container"
    ></div>
  `;

  // --------------------------------------------------
  // Gombok lekérése
  // --------------------------------------------------

  const allProfileFiltrationButton = document.getElementById(
    "all-profiles-count-filter-button",
  );

  const allAdminsFiltrationButton = document.getElementById(
    "all-admins-count-filter-button",
  );

  const allCountersFiltrationButton = document.getElementById(
    "all-counters-count-filter-button",
  );

  const allStoragesFiltrationButton = document.getElementById(
    "all-storages-count-filter-button",
  );

  // --------------------------------------------------
  // Összes szűrő egy tömbben
  // --------------------------------------------------

  const filterButtons = [
    allProfileFiltrationButton,
    allAdminsFiltrationButton,
    allCountersFiltrationButton,
    allStoragesFiltrationButton,
  ];

  // --------------------------------------------------
  // Aktív szűrő kezelése
  // --------------------------------------------------

  function setActiveFilter(activeButton) {
    filterButtons.forEach((button) => {
      button.classList.remove("active");
    });

    activeButton.classList.add("active");
  }

  // --------------------------------------------------
  // Profilok betöltése
  // --------------------------------------------------

  currentUserFilter = " ";

  setActiveFilter(allProfileFiltrationButton);

  const userList = await LoadUsers();

  FillUsers(userList);

  panelLabel.textContent = "Profilok";

  // --------------------------------------------------
  // Összes profil
  // --------------------------------------------------

  allProfileFiltrationButton.addEventListener("click", async () => {
    currentUserFilter = " ";

    setActiveFilter(allProfileFiltrationButton);

    const newUserList = await LoadUsers();

    FillUsers(newUserList);
  });

  // --------------------------------------------------
  // Adminisztrátorok
  // --------------------------------------------------

  allAdminsFiltrationButton.addEventListener("click", async () => {
    currentUserFilter = "Admin";

    setActiveFilter(allAdminsFiltrationButton);

    const newUserList = await LoadUsers();

    FillUsers(newUserList.filter((user) => user.roleName === "Admin"));
  });

  // --------------------------------------------------
  // Kassza profilok
  // --------------------------------------------------

  allCountersFiltrationButton.addEventListener("click", async () => {
    currentUserFilter = "Counter";

    setActiveFilter(allCountersFiltrationButton);

    const newUserList = await LoadUsers();

    FillUsers(newUserList.filter((user) => user.roleName === "Counter"));
  });

  // --------------------------------------------------
  // Raktár profilok
  // --------------------------------------------------

  allStoragesFiltrationButton.addEventListener("click", async () => {
    currentUserFilter = "Storage";

    setActiveFilter(allStoragesFiltrationButton);

    const newUserList = await LoadUsers();

    FillUsers(newUserList.filter((user) => user.roleName === "Storage"));
  });
}

document
  .getElementById("profil-panel-sidebar-button")
  .addEventListener("click", ProfilPanel);

const passwordField = document.getElementById("user-creator-password-input");
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

ProfilPanel();

//  User Creator Panel

document
  .getElementById("user-creator-save-button")
  .addEventListener("click", async () => {
    LoadingSpinner(true);

    const userNameInput = document.getElementById(
      "user-creator-username-input",
    );

    const passwordInput = document.getElementById(
      "user-creator-password-input",
    );

    const roleSelecter = document.getElementById("role-selecter");

    const modalElement = document.getElementById("user-creation-modal");
    const modal = bootstrap.Modal.getInstance(modalElement);

    const offcanvasElement = document.getElementById("sideMenu");
    const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);

    var username = userNameInput.value;
    var password = passwordInput.value;
    var roleId = roleSelecter.value;

    var requestBody = {
      UserName: username,
      RoleId: Number(roleId),
      Password: password,
    };

    var creationResponse = await SendCreateUserRequest(requestBody);

    LoadingSpinner(false);
    if (creationResponse == true) {
      DisplayAlert("success", "Sikeres létrehozás!");
      modal.hide();
      offcanvas.hide();
      var newUserList = await LoadUsers();
      FillUsers(newUserList);
    } else {
      DisplayAlert("danger", creationResponse);
    }
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

// Spinner function

function LoadingSpinner(isLoading) {
  const spinningOverlay = document.getElementById("spinning-overlay");
  if (isLoading) {
    spinningOverlay.classList.remove("d-none");
  } else {
    spinningOverlay.classList.add("d-none");
  }
}

// User Activation functions

window.Activation = async function Activation(username) {
  const response = await SendUserActivationRequest(username);

  if (response == true) {
    DisplayAlert("success", "Sikeres aktiválás!");
    let newUserList = await LoadUsers();
    switch (currentUserFilter) {
      case " ":
        FillUsers(newUserList);
        break;
      case "Admin":
        FillUsers(newUserList.filter((u) => u.roleName == "Admin"));
        break;
      case "Counter":
        FillUsers(newUserList.filter((u) => u.roleName == "Counter"));
        break;
      case "Storage":
        FillUsers(newUserList.filter((u) => u.roleName == "Storage"));
        break;
    }
  } else {
    DisplayAlert("danger", response);
  }
};

window.Deactivation = async function Deactivation(username) {
  const response = await SendUserDeactivationRequest(username);

  if (response == true) {
    DisplayAlert("success", "Sikeres deaktiválás!");
    let newUserList = await LoadUsers();
    switch (currentUserFilter) {
      case " ":
        FillUsers(newUserList);
        break;
      case "Admin":
        FillUsers(newUserList.filter((u) => u.roleName == "Admin"));
        break;
      case "Counter":
        FillUsers(newUserList.filter((u) => u.roleName == "Counter"));
        break;
      case "Storage":
        FillUsers(newUserList.filter((u) => u.roleName == "Storage"));
        break;
    }
  } else {
    DisplayAlert("danger", response);
  }
};

window.OpenUserUpdateModal = async function (username) {
  selectedUserName = username;

  const users = await RequestAllUsers();
  const user = users.find((u) => u.userName === username);

  if (!user) return;

  document.getElementById("update-original-username").value = user.userName;

  document.getElementById("update-username-input").value = user.userName;

  const roleSelect = document.getElementById("update-role-select");

  switch (user.roleName) {
    case "Admin":
      roleSelect.value = "1";
      break;

    case "Counter":
      roleSelect.value = "2";
      break;

    case "Storage":
      roleSelect.value = "3";
      break;
  }

  const modal = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("user-update-modal"),
  );

  modal.show();
};

document
  .getElementById("user-update-save-button")
  .addEventListener("click", async () => {
    if (!selectedUserName) return;

    const requestBody = {
      OldUserName: selectedUserName,
      UserName: document.getElementById("update-username-input").value,
      RoleId: Number(document.getElementById("update-role-select").value),
    };

    const response = await SendUserUpdateRequest(requestBody);

    if (response === true) {
      DisplayAlert("success", "Sikeres módosítás!");

      const modal = bootstrap.Modal.getOrCreateInstance(
        document.getElementById("user-update-modal"),
      );

      modal.hide();
      selectedUserName = null;

      const newUserList = await LoadUsers();
      FillUsers(newUserList);
    } else {
      DisplayAlert("danger", response);
    }
  });
