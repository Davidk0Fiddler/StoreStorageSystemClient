const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const workspaceRoot = path.resolve(__dirname, "..");
const roleGuardPath = path.join(workspaceRoot, "pages/shared/RoleGuard.js");

async function runRoleGuard({ requiredRoles, token, roleName, loginUrl, unauthorizedUrl }) {
  const source = await fs.readFile(roleGuardPath, "utf8");
  const sessionValues = new Map([
    ["token", token],
    ["roleName", roleName],
    ["userName", "test-user"],
  ]);
  const removedKeys = [];
  let redirectedTo = null;
  const window = {
    __pageAccessAllowed: null,
    location: { replace: (url) => { redirectedTo = url; } },
  };
  const document = {
    documentElement: {
      dataset: {
        ...(requiredRoles === undefined ? {} : { requiredRoles }),
        ...(loginUrl ? { loginUrl } : {}),
        ...(unauthorizedUrl ? { unauthorizedUrl } : {}),
      },
    },
  };
  const sessionStorage = {
    getItem: (key) => sessionValues.get(key) ?? null,
    removeItem: (key) => {
      removedKeys.push(key);
      sessionValues.delete(key);
    },
  };

  vm.runInNewContext(source, { window, document, sessionStorage, console: { error() {} } });

  return { allowed: window.__pageAccessAllowed, redirectedTo, removedKeys };
}

test("RoleGuard only allows a signed-in user with an explicitly allowed role", async () => {
  const result = await runRoleGuard({
    requiredRoles: "Admin, Storage",
    token: "valid-token",
    roleName: "Storage",
  });

  assert.equal(result.allowed, true);
  assert.equal(result.redirectedTo, null);
});

test("RoleGuard redirects a signed-in user with a disallowed role", async () => {
  const result = await runRoleGuard({
    requiredRoles: "Admin",
    token: "valid-token",
    roleName: "Counter",
    unauthorizedUrl: "../LandingPage/LandingPage.html",
  });

  assert.equal(result.allowed, false);
  assert.equal(result.redirectedTo, "../LandingPage/LandingPage.html");
  assert.deepEqual(result.removedKeys, []);
});

test("RoleGuard redirects signed-out users to login and clears stale identity", async () => {
  const result = await runRoleGuard({
    requiredRoles: "Admin",
    token: null,
    roleName: "Admin",
    loginUrl: "../LoginPage/LoginPage.html",
  });

  assert.equal(result.allowed, false);
  assert.equal(result.redirectedTo, "../LoginPage/LoginPage.html");
  assert.deepEqual(result.removedKeys, ["userName", "roleName"]);
});

test("RoleGuard denies a protected page with missing role configuration", async () => {
  const result = await runRoleGuard({
    token: "valid-token",
    roleName: "Admin",
  });

  assert.equal(result.allowed, false);
  assert.equal(result.redirectedTo, "../LoginPage/LoginPage.html");
});

test("every protected application page declares its role policy before module scripts", async () => {
  const pages = [
    ["pages/LandingPage/LandingPage.html", "Admin,Counter,Storage"],
    ["pages/CounterPage/CounterPage.html", "Admin,Counter"],
    ["pages/AddStockPage/AddStockPage.html", "Admin,Storage"],
    ["pages/StockPanel/StockPanel.html", "Admin,Counter,Storage"],
    ["pages/ProfilPanel/ProfilPanel.html", "Admin"],
    ["pages/StatisticsPanel/StatisticsPanel.html", "Admin"],
    ["pages/AdminPanel/AdminPanel.html", "Admin"],
  ];

  for (const [relativePath, expectedRoles] of pages) {
    const html = await fs.readFile(path.join(workspaceRoot, relativePath), "utf8");
    const rolePolicy = html.match(/<html\b[^>]*data-required-roles="([^"]+)"/i)?.[1];
    const roleGuardIndex = html.indexOf("../shared/RoleGuard.js");
    const moduleIndex = html.indexOf('type="module"');
    const headEndIndex = html.indexOf("</head>");

    assert.equal(rolePolicy, expectedRoles, `${relativePath} szerepkörlistája`);
    assert.notEqual(roleGuardIndex, -1, `${relativePath} betölti a RoleGuard modult`);
    assert.ok(roleGuardIndex < headEndIndex, `${relativePath} a body előtt ellenőrzi a hozzáférést`);
    assert.ok(moduleIndex === -1 || roleGuardIndex < moduleIndex, `${relativePath} a feature előtt ellenőriz`);
  }
});
