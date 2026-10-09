import {
  GetAllUsers,
  CreateUser,
  ActivateUser,
  DeactivateUser,
  UpdateUser,
} from "./UserService.js";

import {
  GetCurrentUserFilter,
  SetCurrentUserFilter,
  GetSelectedUserName,
  SetSelectedUserName,
  ClearSelectedUserName,
} from "./UserState.js";

import { RenderUserList } from "../ui/UserList.js";

import {
  RenderUserFilter,
  GetUserFilterButtons,
  SetActiveUserFilter,
  GetUsersByFilter,
} from "../ui/UserFilter.js";

import {
  GetUserCreationSaveButton,
  GetUserCreationData,
  GetUserUpdateSaveButton,
  GetUserUpdateData,
  GetUserUpdateModal,
  SetUserUpdateData,
  InitializePasswordToggle,
} from "../ui/UserModal.js";

import { DisplayAlert } from "../../shared/Alert.js";

let users = [];

/*
 * Felhasználók betöltése
 */
async function LoadUsers() {
  const result = await GetAllUsers();

  if (!result) {
    DisplayAlert("danger", "Nem sikerült betölteni a felhasználókat.");

    return false;
  }

  users = result;

  UpdateUserCounts(users);
  RenderCurrentFilter();

  return true;
}

/*
 * Felhasználószámok frissítése
 */
function UpdateUserCounts(userList) {
  const profileCount = document.getElementById("profile-count");

  const adminCount = document.getElementById("admin-count");

  const counterCount = document.getElementById("counter-count");

  const storageCount = document.getElementById("storage-count");

  if (profileCount) {
    profileCount.textContent = userList.length;
  }

  if (adminCount) {
    adminCount.textContent = userList.filter(
      (user) => user.roleName === "Admin",
    ).length;
  }

  if (counterCount) {
    counterCount.textContent = userList.filter(
      (user) => user.roleName === "Counter",
    ).length;
  }

  if (storageCount) {
    storageCount.textContent = userList.filter(
      (user) => user.roleName === "Storage",
    ).length;
  }
}

/*
 * Aktuális szűrő megjelenítése
 */
function RenderCurrentFilter() {
  const currentFilter = GetCurrentUserFilter();

  const filteredUsers = GetUsersByFilter(users, currentFilter);

  RenderUserList(filteredUsers);
}

/*
 * Szűrők inicializálása
 */
function InitializeFilters() {
  const filterButtons = GetUserFilterButtons();

  filterButtons.all?.addEventListener("click", async () => {
    SetCurrentUserFilter(" ");

    SetActiveUserFilter(filterButtons.all);

    await LoadUsers();
  });

  filterButtons.admin?.addEventListener("click", () => {
    SetCurrentUserFilter("Admin");

    SetActiveUserFilter(filterButtons.admin);

    RenderCurrentFilter();
  });

  filterButtons.counter?.addEventListener("click", () => {
    SetCurrentUserFilter("Counter");

    SetActiveUserFilter(filterButtons.counter);

    RenderCurrentFilter();
  });

  filterButtons.storage?.addEventListener("click", () => {
    SetCurrentUserFilter("Storage");

    SetActiveUserFilter(filterButtons.storage);

    RenderCurrentFilter();
  });
}

/*
 * Felhasználókártyák eseményei
 */
function InitializeUserCardEvents() {
  const usersContainer = document.getElementById("users-container");

  if (!usersContainer) {
    return;
  }

  usersContainer.addEventListener("click", async (event) => {
    const updateButton = event.target.closest(".user-update-button");

    const statusButton = event.target.closest(".user-status-button");

    if (updateButton) {
      const card = updateButton.closest(".user-card");

      const username = card?.dataset.username;

      if (username) {
        await OpenUserUpdate(username);
      }

      return;
    }

    if (statusButton) {
      const card = statusButton.closest(".user-card");

      const username = card?.dataset.username;

      if (!username) {
        return;
      }

      const user = users.find((item) => item.userName === username);

      if (!user) {
        return;
      }

      if (user.isActive) {
        await DeactivateSelectedUser(username);
      } else {
        await ActivateSelectedUser(username);
      }
    }
  });
}

/*
 * Felhasználó aktiválása
 */
async function ActivateSelectedUser(username) {
  const response = await ActivateUser(username);

  if (!response.success) {
    DisplayAlert("danger", response.message);
    return;
  }

  await LoadUsers();

  DisplayAlert("success", "Sikeres aktiválás!");
}

/*
 * Felhasználó deaktiválása
 */
async function DeactivateSelectedUser(username) {
  const response = await DeactivateUser(username);

  if (!response.success) {
    DisplayAlert("danger", response.message);
    return;
  }

  await LoadUsers();

  DisplayAlert("success", "Sikeres deaktiválás!");
}

/*
 * Felhasználó módosító modal megnyitása
 */
async function OpenUserUpdate(username) {
  const user = users.find((item) => item.userName === username);

  if (!user) {
    return;
  }

  SetSelectedUserName(username);

  SetUserUpdateData(user);

  const modalElement = GetUserUpdateModal();

  if (!modalElement) {
    return;
  }

  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.show();
}

/*
 * Felhasználó létrehozása
 */
async function HandleCreateUser() {
  const userData = GetUserCreationData();

  const requestBody = {
    UserName: userData.userName,

    RoleId: userData.roleId,

    Password: userData.password,
  };

  const spinningOverlay = document.getElementById("spinning-overlay");

  spinningOverlay?.classList.remove("d-none");

  const response = await CreateUser(requestBody);

  spinningOverlay?.classList.add("d-none");

  if (response === true) {
    DisplayAlert("success", "Sikeres létrehozás!");

    const modalElement = document.getElementById("user-creation-modal");

    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);

      modal?.hide();
    }

    const offcanvasElement = document.getElementById("sideMenu");

    if (offcanvasElement) {
      const offcanvas =
        bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);

      offcanvas.hide();
    }

    await LoadUsers();

    return;
  }

  DisplayAlert("danger", response);
}

/*
 * Felhasználó módosítása
 */
async function HandleUpdateUser() {
  const selectedUserName = GetSelectedUserName();

  if (!selectedUserName) {
    return;
  }

  const userData = GetUserUpdateData();

  const requestBody = {
    OldUserName: selectedUserName,

    UserName: userData.userName,

    RoleId: userData.roleId,
  };

  const response = await UpdateUser(requestBody);

  if (response === true) {
    DisplayAlert("success", "Sikeres módosítás!");

    const modalElement = GetUserUpdateModal();

    if (modalElement) {
      const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

      modal.hide();
    }

    ClearSelectedUserName();

    await LoadUsers();

    return;
  }

  DisplayAlert("danger", response);
}

/*
 * Létrehozás inicializálása
 */
function InitializeCreation() {
  const saveButton = GetUserCreationSaveButton();

  saveButton?.addEventListener("click", HandleCreateUser);
}

/*
 * Módosítás inicializálása
 */
function InitializeUpdate() {
  const saveButton = GetUserUpdateSaveButton();

  saveButton?.addEventListener("click", HandleUpdateUser);
}

/*
 * Feature inicializálása
 */
function InitializePanel() {
  const filterButtons = GetUserFilterButtons();

  SetCurrentUserFilter(" ");

  if (filterButtons.all) {
    SetActiveUserFilter(filterButtons.all);
  }

  InitializeFilters();
  InitializeUserCardEvents();
  InitializeCreation();
  InitializeUpdate();
  InitializePasswordToggle();
}

/*
 * User Feature indítása
 */
export async function InitializeUserFeature() {
  if (!RenderUserFilter()) {
    return;
  }

  InitializePanel();

  const panelLabel = document.getElementById("panel-label");

  if (panelLabel) {
    panelLabel.textContent = "Profilok";
  }

  await LoadUsers();
}

function CreateUserPanel() {
  const mainContainer = document.getElementById("main-container");

  if (!mainContainer) {
    return;
  }

  mainContainer.innerHTML = `
    <!-- ide kerül a régi ProfilPanel filter HTML-je -->

    <div id="users-container"
         class="row justify-content-center">
    </div>
  `;
}
