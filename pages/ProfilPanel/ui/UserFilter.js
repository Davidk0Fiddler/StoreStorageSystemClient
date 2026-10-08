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
