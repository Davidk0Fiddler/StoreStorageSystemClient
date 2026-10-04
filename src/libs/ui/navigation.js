/**
 * Page navigation.
 *
 * The renderer has no router: navigating means loading another HTML document
 * with `window.location.href`. This module resolves a route name into the
 * correct relative path, so features never hard-code
 * `../../other-feature/OtherPage.html` strings in their markup.
 *
 * Every route is relative to a feature page, which lives in
 * `src/features/<feature>/ui/`. Reaching a sibling feature therefore means
 * climbing out of the current feature folder first: `../../<feature>/ui/...`.
 */

export const ROUTES = {
  loading: "../../loading/ui/LoadingPage.html",
  login: "../../auth/ui/LoginPage.html",
  dashboard: "../../dashboard/ui/LandingPage.html",
  counter: "../../counter/ui/CounterPage.html",
  catalog: "../../catalog/ui/AddStockPage.html",
  inventory: "../../inventory/ui/StockPanel.html",
  statistics: "../../statistics/ui/StatisticsPanel.html",
  users: "../../users/ui/ProfilPanel.html",
};

/**
 * Navigates to a named route.
 *
 * @param {keyof typeof ROUTES} route
 */
export function GoToPage(route) {
  const target = ROUTES[route];

  if (!target) {
    throw new Error(`Ismeretlen útvonal: ${route}`);
  }

  window.location.href = target;
}