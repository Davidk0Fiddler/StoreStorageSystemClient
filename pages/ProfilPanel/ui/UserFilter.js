export function GetUserFilterButtons() {
  return {
    all: document.getElementById("all-profiles-count-filter-button"),

    admin: document.getElementById("all-admins-count-filter-button"),

    counter: document.getElementById("all-counters-count-filter-button"),

    storage: document.getElementById("all-storages-count-filter-button"),
  };
}

export function SetActiveUserFilter(activeButton) {
  const filterButtons = Object.values(GetUserFilterButtons());

  filterButtons.forEach((button) => {
    button?.classList.remove("active");
  });

  activeButton?.classList.add("active");
}

export function GetUsersByFilter(users, filter) {
  switch (filter) {
    case "Admin":
      return users.filter((user) => user.roleName === "Admin");

    case "Counter":
      return users.filter((user) => user.roleName === "Counter");

    case "Storage":
      return users.filter((user) => user.roleName === "Storage");

    default:
      return users;
  }
}

export function RenderUserFilter() {
  const mainContainer = document.getElementById("main-container");

  if (!mainContainer) {
    return false;
  }

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

  return true;
}
