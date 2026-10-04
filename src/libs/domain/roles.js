/**
 * Domain concepts shared across features.
 *
 * Roles are a business rule (what a user is allowed to see and do), so they
 * live in the domain layer rather than in the UI that happens to read them.
 */

export const ROLES = {
  ADMIN: "Admin",
  COUNTER: "Counter",
  STORAGE: "Storage",
};

/**
 * Navigation entries of the dashboard, each guarded by the roles allowed to
 * open it. Previously this lived inline in LandingPage.js as template strings.
 */
export const DASHBOARD_ENTRIES = [
  {
    id: "counter",
    icon: "bi bi-shop-window",
    label: "Kassza mód",
    roles: [ROLES.ADMIN, ROLES.COUNTER],
    route: "counter",
  },
  {
    id: "add-stock",
    icon: "bi bi-clipboard2-plus",
    label: "Áru felvétel",
    roles: [ROLES.ADMIN, ROLES.STORAGE],
    route: "catalog",
  },
  {
    id: "stock",
    icon: "bi bi-box-seam",
    label: "Áru Panel",
    roles: [ROLES.ADMIN, ROLES.STORAGE, ROLES.COUNTER],
    route: "inventory",
  },
  {
    id: "users",
    icon: "bi bi-people",
    label: "Profil Panel",
    roles: [ROLES.ADMIN],
    route: "users",
  },
  {
    id: "statistics",
    icon: "bi bi-clipboard-data",
    label: "Statisztika Panel",
    roles: [ROLES.ADMIN],
    route: "statistics",
  },
  {
    id: "admin",
    icon: "bi bi-shield",
    label: "Admin Panel",
    roles: [ROLES.ADMIN],
    route: null,
  },
];

/**
 * Returns the dashboard entries the given role is allowed to open.
 *
 * @param {string|null} roleName
 * @returns {typeof DASHBOARD_ENTRIES}
 */
export function entriesForRole(roleName) {
  return DASHBOARD_ENTRIES.filter((entry) => entry.roles.includes(roleName));
}

/**
 * @param {string|null} roleName
 * @returns {boolean} True when the user may manage products and stock.
 */
export function canManageStock(roleName) {
  return roleName === ROLES.ADMIN || roleName === ROLES.STORAGE;
}

/**
 * @param {string|null} roleName
 * @returns {boolean} True when the user may administer other accounts.
 */
export function isAdmin(roleName) {
  return roleName === ROLES.ADMIN;
}