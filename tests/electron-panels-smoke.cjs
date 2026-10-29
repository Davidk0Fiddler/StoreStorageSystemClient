const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { setTimeout: delay } = require("node:timers/promises");

const projectRoot = path.resolve(__dirname, "..");
const electronBinary = require("electron");

class DevToolsPipe {
  constructor(child) {
    this.writer = child.stdio[3];
    this.reader = child.stdio[4];
    this.buffer = "";
    this.nextId = 1;
    this.pending = new Map();

    this.reader.on("data", (chunk) => {
      this.buffer += chunk.toString();
      let end;
      while ((end = this.buffer.indexOf("\0")) >= 0) {
        const raw = this.buffer.slice(0, end);
        this.buffer = this.buffer.slice(end + 1);
        if (!raw) continue;
        let message;
        try {
          message = JSON.parse(raw);
        } catch {
          continue;
        }
        const pending = this.pending.get(message.id);
        if (!pending) continue;
        clearTimeout(pending.timeout);
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.resolve(message.result);
      }
    });

    this.reader.on("close", () => {
      for (const pending of this.pending.values()) {
        clearTimeout(pending.timeout);
        pending.reject(new Error("Az Electron DevTools csatornája bezárult."));
      }
      this.pending.clear();
    });
  }

  send(method, params = {}, sessionId, timeoutMs = 7000) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`DevTools időtúllépés: ${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timeout });
      this.writer.write(`${JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })}\0`);
    });
  }

  async evaluate(expression, timeoutMs = 7000) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    }, this.sessionId, timeoutMs);
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || "A felületi próba hibát jelzett.");
    }
    return result.result?.value;
  }
}

function createMockApiScript() {
  return `(() => {
    const products = [
      { sku: "AGE-01", productName: "Korhatáros ital", productSize: "db", barcode: "AGE01", canBePurchasedByMinors: false },
      { sku: "MILK-01", productName: "Tej", productSize: "db", barcode: "MILK01", canBePurchasedByMinors: true, brand: "Minta márka", productType: "Tejtermék", description: "Mockolt termékleírás", unit: "db", imageURL: "" },
    ];
    const salesRows = [
      { sku: "MILK-01", productName: "Tej", productType: "Tejtermék", brand: "Minta márka", description: "Mockolt termékleírás", totalPurchased: 4, unit: "db", salesCount: 2, grossRevenue: 1000, costOfGoods: 500, profit: 250, depositAmount: 50, vatRate: 27 },
      { sku: "AGE-01", productName: "Korhatáros ital", productType: "Ital", brand: "Másik márka", totalPurchased: 2, unit: "kg", salesCount: 1, grossRevenue: 700, costOfGoods: 300, profit: 100, depositAmount: 0, vatRate: 18 },
    ];
    const stockListing = [{ stockId: 42, id: 42, productName: "Tej", sku: "MILK-01", brand: "Minta márka", productType: "Tejtermék", productSize: "db", quantity: 12, originalQuantity: 12, shopQuantity: 5, price: 250, currentPrice: 250, importPrice: 100, expirationDate: "2027-12-31", isActive: true }];
    const stockDetail = { stockId: 42, id: 42, product: { sku: "MILK-01", productName: "Tej", brand: "Minta márka", productType: "Tejtermék", productSize: "db", barcode: "MILK01", imageURL: "", hasDeposit: false, isActive: true }, quantity: 12, originalQuantity: 12, shopQuantity: 5, currentPrice: 250, importPrice: 100, invoiceId: "INV-42", transitId: "TR-42", expirationDate: "2027-12-31", recievedAt: "2026-10-01", isDiscounted: false };
    const state = {
      productActive: true,
      documents: [{ id: 17, stockId: 42, fileName: "szamla-minta.pdf", sizeBytes: 1200, uploadedAtUtc: "2026-10-01T10:00:00Z", uploadedBy: "Admin" }],
      requests: [],
    };
    window.__mockRequests = state.requests;

    const jsonResponse = (data, status = 200) => new Response(JSON.stringify(data ?? null), { status, headers: { "Content-Type": "application/json" } });
    const noContent = () => new Response(null, { status: 204 });
    const bodyOf = (body) => {
      if (typeof body === "string") { try { return JSON.parse(body); } catch { return body; } }
      if (body instanceof FormData) return { formFields: [...body.keys()], fileNames: [...body.values()].filter((value) => value instanceof File).map((value) => value.name) };
      return body ?? null;
    };

    window.fetch = async (input, init = {}) => {
      const url = typeof input === "string" ? input : input.url;
      const parsed = new URL(url, location.href);
      const route = parsed.pathname.toLowerCase();
      const method = String(init.method ?? input.method ?? "GET").toUpperCase();
      const requestBody = bodyOf(init.body);
      state.requests.push({ method, path: parsed.pathname, query: Object.fromEntries(parsed.searchParams), body: requestBody });

      if (route.endsWith("/getproductsforcashier")) return jsonResponse(products);
      if (route.endsWith("/isproductavailableforcashier")) return jsonResponse({ isAvailable: true, unitPrice: 250, afaPercent: 27, deposit: 0 });
      if (route.endsWith("/savepurchase")) return jsonResponse({ message: "A mockolt vásárlás elmentve." });

      if (route.endsWith("/admin/products") && method === "GET") return jsonResponse([{ sku: "MILK-01", productName: "Tej", barcode: "MILK01", brand: "Minta márka", productType: "Tejtermék", isActive: state.productActive, imageURL: "" }]);
      if (route.endsWith("/admin/products/milk-01/status") && method === "PATCH") {
        state.productActive = Boolean(requestBody?.isActive);
        return jsonResponse({ isActive: state.productActive });
      }
      if (route.endsWith("/admin/stocks") && method === "GET") return jsonResponse([stockListing[0]]);
      if (route.includes("/admin/logs/audit") && method === "GET") return jsonResponse({ items: [{ id: 91, createdAt: "2026-10-29T09:00:00Z", userName: "Admin", action: "UPDATE", description: "Mockolt audit leírás", oldValues: null, newValues: null }], totalCount: 1, page: 1, pageSize: 25, pageCount: 1 });

      if (route.endsWith("/stocks/listing") && method === "GET") return jsonResponse(stockListing);
      if (route.endsWith("/stocks/42") && method === "GET") return jsonResponse(stockDetail);
      if (route.endsWith("/admin/stocks/42/documents") && method === "GET") return jsonResponse({ items: state.documents });
      if (route.endsWith("/admin/stocks/42/documents") && method === "POST") {
        const document = { id: 18, stockId: 42, fileName: requestBody?.fileNames?.[0] ?? "feltoltott.pdf", sizeBytes: 2048, uploadedAtUtc: "2026-10-29T10:00:00Z", uploadedBy: "Admin" };
        state.documents.push(document);
        return jsonResponse(document, 201);
      }
      if (route.startsWith("/api/admin/documents/") && method === "GET") return new Response(new Uint8Array([37, 80, 68, 70, 45, 49, 46, 55]), { status: 200, headers: { "Content-Type": "application/pdf" } });
      if (route.startsWith("/api/admin/documents/") && method === "DELETE") {
        const id = Number(parsed.pathname.split("/").at(-1));
        state.documents = state.documents.filter((item) => item.id !== id);
        return noContent();
      }

      if (route.endsWith("/statistics/total-income")) return jsonResponse({ totalIncome: 1700, grossRevenue: 1700, salesCount: 3, currency: "HUF" });
      if (route.endsWith("/statistics/daily-income")) return jsonResponse({ date: parsed.searchParams.get("date"), income: 700, shopLogs: [{ id: 7, totalPrice: 700, dateTime: new Date().toISOString() }] });
      if (route.endsWith("/statistics/weekly-income")) return jsonResponse({ date: parsed.searchParams.get("date"), dailyShopLogs: [{ date: new Date().toISOString().slice(0, 10), income: 700 }] });
      if (route.endsWith("/statistics/monthly-income")) return jsonResponse({ date: parsed.searchParams.get("date"), dailyIncome: [{ date: new Date().toISOString().slice(0, 10), income: 700 }] });
      if (route.endsWith("/statistics/yearly-income")) return jsonResponse({ date: parsed.searchParams.get("date"), monthlyIncome: [{ date: new Date().toISOString().slice(0, 7), income: 700 }] });
      if (route.endsWith("/statistics/productpurchase")) return jsonResponse(salesRows);
      if (route.endsWith("/statistics/brand-sales")) return jsonResponse({ totalBrands: 2, brands: [{ brandId: 1, brandName: "Minta márka", totalsByUnit: [{ unit: "db", quantity: 4 }], products: [{ sku: "MILK-01", productName: "Tej", productType: "Tejtermék", totalPurchased: 4, unit: "db", description: "Mockolt termékleírás" }] }, { brandId: 2, brandName: "Másik márka", totalsByUnit: [{ unit: "kg", quantity: 2 }], products: [{ sku: "AGE-01", productName: "Korhatáros ital", productType: "Ital", totalPurchased: 2, unit: "kg" }] }] });
      if (route.endsWith("/statistics/transactions")) return jsonResponse({ items: [{ id: 1, dateTime: "2026-10-29T09:00:00Z", type: "income", grossAmount: 1700, description: "Mockolt értékesítés", quantity: 2, unit: "db" }, { id: 2, dateTime: "2026-10-28T12:00:00Z", type: "expense", grossAmount: 900, description: "Mockolt beszerzés", quantity: 3, unit: "db" }], summary: { grossRevenue: 1700, grossPurchases: 900 }, dailyTotals: [{ date: "2026-10-29", grossRevenue: 1700, grossPurchases: 0 }, { date: "2026-10-28", grossRevenue: 0, grossPurchases: 900 }], totalCount: 2, page: 1, pageSize: 50, pageCount: 1 });
      if (route.endsWith("/statistics/vat")) return jsonResponse({ grossRevenue: 1700, outputVat: 300, rates: [{ rate: 27, salesVatAmount: 250, salesNetAmount: 900, salesGrossAmount: 1150, soldQuantities: { db: 4 } }, { rate: 0, salesVatAmount: 0, salesNetAmount: null, salesGrossAmount: 550, soldQuantities: { db: 2 } }], dailyTotals: [] });
      if (route.endsWith("/products/listing")) return jsonResponse(products.map((product) => ({ ...product, brand: product.brand ?? "Minta márka", productType: product.productType ?? "Tejtermék", description: product.description ?? "Mockolt termékleírás", productSize: product.productSize ?? "db", imageURL: "", vatRate: product.sku === "MILK-01" ? 27 : 18, depositAmount: product.sku === "MILK-01" ? 50 : 0 })));

      return jsonResponse({ message: "Mock API: nincs válasz ehhez: " + method + " " + parsed.pathname }, 404);
    };

    class MockChart {
      constructor(canvas, config) {
        this.canvas = canvas;
        this.data = config.data;
        this.config = config;
        this.chartArea = { left: 0, right: 300, top: 0, bottom: 180 };
        this.ctx = { save() {}, restore() {}, fillText() {} };
        window.__mockCharts = window.__mockCharts ?? [];
        window.__mockCharts.push(this);
        for (const plugin of config.plugins ?? []) plugin.afterDraw?.(this);
      }
      update() {}
      destroy() {}
    }
    window.Chart = MockChart;
  })();`;
}

async function waitFor(devTools, expression, description, timeoutMs = 12000) {
  const deadline = Date.now() + timeoutMs;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const value = await devTools.evaluate(expression, 2500);
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw new Error(`${description} (utolsó hiba: ${lastError?.message ?? "nincs"})`);
}

async function waitForPageTarget(devTools, child, getOutput) {
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Az Electron leállt (kód: ${child.exitCode}). ${getOutput()}`);
    }
    try {
      const targets = await devTools.send("Target.getTargets", {}, undefined, 1500);
      const page = targets.targetInfos.find((item) => item.type === "page");
      if (page) return page;
    } catch {
      // A DevTools pipe a Chromium indulása közben még nem válaszolhat.
    }
    await delay(150);
  }
  throw new Error(`Az Electron oldalcélpontja nem jelent meg. ${getOutput()}`);
}

async function click(devTools, selector) {
  const clicked = await devTools.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) return false; element.click(); return true; })()`);
  assert.equal(clicked, true, `A ${selector} elem legyen kattintható.`);
}

async function waitForModalReady(devTools, selector, description) {
  const selectorLiteral = JSON.stringify(selector);
  await waitFor(
    devTools,
    `(() => { const element = document.querySelector(${selectorLiteral}); const modal = element && bootstrap.Modal.getInstance(element); return Boolean(element?.classList.contains("show") && modal?._isTransitioning !== true); })()`,
    description,
  );
}

async function navigate(devTools, role, relativePage) {
  await devTools.evaluate(`sessionStorage.setItem("token", "mock-token"); sessionStorage.setItem("roleName", ${JSON.stringify(role)}); sessionStorage.setItem("userName", "Mock ${role}");`);
  const url = pathToFileURL(path.join(projectRoot, relativePage)).href;
  await devTools.send("Page.navigate", { url }, devTools.sessionId);
  await waitFor(devTools, `location.href.endsWith(${JSON.stringify(relativePage.replaceAll("\\", "/"))})`, `${relativePage} oldal betöltése`);
  await waitFor(devTools, `window.__pageAccessAllowed === true`, `${relativePage} szerepkör-ellenőrzés`);
  await waitFor(devTools, `document.readyState === "complete"`, `${relativePage} dokumentum betöltése`);
  await delay(150);
  // Electron's file navigation may replace the execution context after the
  // DevTools document-start hook was registered. Install the mock in the
  // active document too, before any user-triggered requests are made.
  await devTools.evaluate(createMockApiScript());
}

async function runCashierScenario(devTools) {
  await navigate(devTools, "Counter", "pages/CounterPage/CounterPage.html");
  await click(devTools, "#open-cash-register-btn");
  try {
    await waitFor(devTools, `document.querySelectorAll("#cashier-product-list .card").length === 2`, "A mockolt kasszatermékek betöltése");
  } catch (error) {
    const state = await devTools.evaluate(`({ role: sessionStorage.getItem("roleName"), mockRequests: window.__mockRequests, listText: document.querySelector("#cashier-product-list")?.innerText, modalOpen: document.querySelector("#cash-register-modal")?.classList.contains("show") })`);
    throw new Error(`${error.message} Állapot: ${JSON.stringify(state)}`);
  }
  await click(devTools, "#cashier-product-list .card");
  await waitForModalReady(devTools, "#buyer-age-confirmation-modal", "A korhatárkérdés megjelenése");
  await devTools.evaluate(`window.__agePromptHidden = false; document.querySelector("#buyer-age-confirmation-modal").addEventListener("hidden.bs.modal", () => { window.__agePromptHidden = true; }, { once: true });`);
  await click(devTools, "[data-buyer-is-minor]");
  try {
    await waitFor(devTools, `window.__agePromptHidden === true`, "A kiskorú választás lezárása");
  } catch (error) {
    const state = await devTools.evaluate(`(() => { const element = document.querySelector("#buyer-age-confirmation-modal"); const modal = bootstrap.Modal.getInstance(element); return { modalClass: element?.className, ariaHidden: element?.getAttribute("aria-hidden"), isShown: modal?._isShown, isTransitioning: modal?._isTransitioning, minorHandler: typeof document.querySelector("[data-buyer-is-minor]")?.onclick, cartCount: document.querySelectorAll("#cashier-cart-list .cart-remove-btn").length }; })()`);
    throw new Error(`${error.message} Állapot: ${JSON.stringify(state)}`);
  }
  let result = await devTools.evaluate(`({ cartCount: document.querySelectorAll("#cashier-cart-list .cart-remove-btn").length, availabilityCalls: window.__mockRequests.filter((item) => item.path.toLowerCase().endsWith("/isproductavailableforcashier")).length })`);
  assert.equal(result.cartCount, 0, "Kiskorú választása után a korhatáros termék nem kerülhet a kosárba.");
  assert.equal(result.availabilityCalls, 0, "A blokkolt terméknél ne induljon készletellenőrző API-hívás.");

  await click(devTools, "#cashier-product-list .card");
  result = await devTools.evaluate(`({ agePromptOpen: document.querySelector("#buyer-age-confirmation-modal").classList.contains("show"), cartCount: document.querySelectorAll("#cashier-cart-list .cart-remove-btn").length })`);
  assert.equal(result.agePromptOpen, false, "Ugyanannál a kiskorú vásárlónál ne kérdezzen rá újra.");
  assert.equal(result.cartCount, 0, "A későbbi próbálkozás se tegye kosárba a korhatáros terméket.");

  await click(devTools, "#cash-register-modal [data-bs-dismiss='modal']");
  await waitFor(devTools, `!document.querySelector("#cash-register-modal").classList.contains("show") && bootstrap.Modal.getInstance(document.querySelector("#cash-register-modal"))?._isShown === false`, "A kassza bezárása");
  await delay(350);
  await click(devTools, "#open-cash-register-btn");
  await waitFor(devTools, `document.querySelectorAll("#cashier-product-list .card").length === 2`, "A kassza újranyitása");
  await click(devTools, "#cashier-product-list .card");
  await waitForModalReady(devTools, "#buyer-age-confirmation-modal", "Új vásárlónál a korhatárkérdés");
  await click(devTools, "[data-buyer-is-adult]");
  await waitFor(devTools, `document.querySelectorAll("#cashier-cart-list .cart-remove-btn").length === 1`, "A felnőtt vásárló termékének kosárba helyezése");
  await click(devTools, "#checkout-button");
  await waitForModalReady(devTools, "#checkout-modal", "A kassza véglegesítése");
  await click(devTools, "#save-purchase-btn");
  await waitFor(devTools, `document.querySelector("[data-cash-register-reminder]")`, "A kasszába beütendő összeg emlékeztetője");
  const reminder = await devTools.evaluate(`document.querySelector("[data-cash-register-reminder]").innerText`);
  assert.match(reminder, /Üsd be az összeget a kasszába/i);
  await click(devTools, "[data-cash-reminder-confirm]");
  await waitFor(devTools, `window.__mockRequests.some((item) => item.path.toLowerCase().endsWith("/savepurchase"))`, "A mockolt vásárlás mentése");
  await waitFor(devTools, `document.querySelectorAll("#cashier-cart-list .cart-remove-btn").length === 0`, "A kosár ürítése sikeres vásárlás után");
  await click(devTools, "#cashier-product-list .card");
  await waitFor(devTools, `document.querySelector("#buyer-age-confirmation-modal").classList.contains("show")`, "Új vásárlásnál ismét korhatár-ellenőrzés");
  assert.ok(await devTools.evaluate(`window.__mockRequests.some((item) => item.path.toLowerCase().endsWith("/isproductavailableforcashier"))`), "A felnőttként jóváhagyott terméknél ellenőrizze a készletet.");
}

async function runAdminScenario(devTools) {
  await navigate(devTools, "Admin", "pages/AdminPanel/AdminPanel.html");
  await click(devTools, '[data-open-admin-panel="products"]');
  await waitFor(devTools, `document.querySelector('[data-admin-toggle="MILK-01"]')`, "Admin terméklista betöltése");
  await click(devTools, '[data-admin-toggle="MILK-01"]');
  await waitForModalReady(devTools, "#admin-confirm-modal", "Termékállapot megerősítő modal");
  assert.match(await devTools.evaluate(`document.querySelector("#admin-confirm-modal").innerText`), /deaktivál/i);
  await click(devTools, "#admin-confirm-modal [data-confirm-action]");
  try {
    await waitFor(devTools, `window.__mockRequests.some((item) => item.method === "PATCH" && item.path.toLowerCase().endsWith("/admin/products/milk-01/status"))`, "Admin termék deaktiválási API-hívás");
  } catch (error) {
    const state = await devTools.evaluate(`({ requests: window.__mockRequests, modal: document.querySelector("#admin-confirm-modal")?.className, active: document.querySelector('[data-admin-toggle="MILK-01"]')?.dataset.adminActive })`);
    throw new Error(`${error.message} Állapot: ${JSON.stringify(state)}`);
  }
  const toggleRequest = await devTools.evaluate(`window.__mockRequests.find((item) => item.method === "PATCH" && item.path.toLowerCase().endsWith("/admin/products/milk-01/status"))`);
  assert.equal(toggleRequest.body.isActive, false, "Deaktiváláskor a megfelelő isActive érték menjen az API-nak.");
  await waitFor(devTools, `document.querySelector('[data-admin-toggle="MILK-01"]')?.dataset.adminActive === "false"`, "Terméklista frissítése a deaktiválás után");

  await click(devTools, "[data-admin-home]");
  await click(devTools, '[data-open-admin-panel="logs"]');
  await click(devTools, '[data-log-type="auditlog"]');
  await waitFor(devTools, `document.querySelector('[data-log-detail="91"]')`, "Auditlog betöltése");
  await click(devTools, '[data-log-detail="91"]');
  await waitFor(devTools, `document.querySelector("#admin-log-details-modal")`, "Auditlog részletek megnyitása");
  assert.match(await devTools.evaluate(`document.querySelector("#admin-log-details-modal").innerText`), /Mockolt audit leírás/, "Az auditlog leírása a részleteknél jelenjen meg.");
}

async function runStockDocumentsScenario(devTools) {
  await navigate(devTools, "Admin", "pages/StockPanel/StockPanel.html");
  await waitFor(devTools, `document.querySelector("#stock-table-body tr")`, "Árupanel készletlista betöltése");
  await click(devTools, "#stock-table-body tr");
  await waitFor(devTools, `document.querySelector("#stock-details-modal").classList.contains("show")`, "Készlettétel részleteinek megnyitása");
  await waitFor(devTools, `document.querySelector('[data-stock-document-open="17"]')`, "A készlettétel PDF-listája");
  await click(devTools, "[data-stock-document-open='17']");
  await waitFor(devTools, `document.querySelector("[data-stock-document-viewer]")`, "PDF előnézet megnyitása");
  assert.ok(await devTools.evaluate(`document.querySelector("[data-stock-document-frame]").src.startsWith("blob:")`), "A PDF előnézet blob URL-t kapjon.");
  await click(devTools, "[data-stock-document-close]");

  const fileAssigned = await devTools.evaluate(`(() => { const input = document.querySelector("[data-stock-document-file]"); if (!input || typeof DataTransfer === "undefined") return false; const transfer = new DataTransfer(); transfer.items.add(new File([new Uint8Array([37,80,68,70,45,49,46,55])], "mock-szamla.pdf", { type: "application/pdf" })); input.files = transfer.files; input.dispatchEvent(new Event("change", { bubbles: true })); return input.files.length === 1; })()`);
  assert.equal(fileAssigned, true, "A teszt PDF-fájl kerüljön a feltöltőmezőbe.");
  await waitFor(devTools, `!document.querySelector("[data-stock-document-upload]").disabled`, "Érvényes PDF feltöltésének engedélyezése");
  await click(devTools, "[data-stock-document-upload]");
  await waitFor(devTools, `window.__mockRequests.some((item) => item.method === "POST" && item.path.toLowerCase().endsWith("/admin/stocks/42/documents"))`, "PDF feltöltési API-hívás");
  await waitFor(devTools, `document.querySelector('[data-stock-document-delete="18"]')`, "Feltöltött PDF megjelenése a listában");
  await click(devTools, '[data-stock-document-delete="18"]');
  await waitForModalReady(devTools, "[data-stock-document-delete-modal]", "PDF törlési megerősítő modal");
  await click(devTools, "[data-stock-document-delete-confirm]");
  await waitFor(devTools, `window.__mockRequests.some((item) => item.method === "DELETE" && item.path.toLowerCase().endsWith("/admin/documents/18"))`, "PDF törlési API-hívás");
  await waitFor(devTools, `!document.querySelector('[data-stock-document-delete="18"]')`, "Törölt PDF eltávolítása a listából");

  await click(devTools, "#close-stock-details-modal-btn");
  await navigate(devTools, "Counter", "pages/StockPanel/StockPanel.html");
  await waitFor(devTools, `document.querySelector("#stock-table-body tr")`, "Árupanel betöltése pénztáros szerepkörrel");
  await click(devTools, "#stock-table-body tr");
  await waitFor(devTools, `document.querySelector("#stock-details-modal").classList.contains("show")`, "Készlet részletei pénztárosként");
  assert.equal(await devTools.evaluate(`!document.querySelector("#modal-stock-documents") || document.querySelector("#modal-stock-documents").classList.contains("d-none")`), true, "A PDF-kezelés pénztáros szerepkörnél legyen rejtve.");
}

async function runStatisticsScenario(devTools) {
  await navigate(devTools, "Admin", "pages/StatisticsPanel/StatisticsPanel.html");
  await waitFor(devTools, `document.querySelector("#total-income-area")?.textContent.includes("1")`, "Bevételek panel betöltése");
  const income = await devTools.evaluate(`document.querySelector("#total-income-area").textContent`);
  assert.match(income, /1[\s\u00a0]?700/);
  await click(devTools, "#weekly-chart-btn");
  await waitFor(devTools, `window.__mockRequests.some((item) => item.path.toLowerCase().includes("/statistics/weekly-income"))`, "Heti bevétel API-hívás");
  await click(devTools, "#monthly-chart-btn");
  await waitFor(devTools, `window.__mockRequests.some((item) => item.path.toLowerCase().includes("/statistics/monthly-income"))`, "Havi bevétel API-hívás");
  await click(devTools, "#yearly-chart-btn");
  await waitFor(devTools, `window.__mockRequests.some((item) => item.path.toLowerCase().includes("/statistics/yearly-income"))`, "Éves bevétel API-hívás");

  await click(devTools, "#top-products-btn");
  await waitFor(devTools, `document.querySelector("#sold-products-list")?.innerText.includes("Tej")`, "Top termékek megjelenése");
  assert.match(await devTools.evaluate(`document.querySelector("#sold-products-total").innerText`), /db/);
  assert.match(await devTools.evaluate(`document.querySelector("#selected-product-description").textContent`), /Mockolt termékleírás/);

  await click(devTools, '[data-panel="brands-panel"]');
  await waitFor(devTools, `document.querySelector("#brands-list")?.innerText.includes("Minta márka")`, "Márka-rangsor betöltése");
  assert.match(await devTools.evaluate(`document.querySelector("#selected-brand-name").textContent`), /Minta márka/);

  await click(devTools, '[data-panel="transactions-panel"]');
  await waitFor(devTools, `document.querySelector("#transactions-list")?.innerText.includes("Mockolt értékesítés")`, "Tranzakciólista betöltése");
  const transactionStyles = await devTools.evaluate(`({ income: document.querySelector("#transactions-list .text-success") !== null, expense: document.querySelector("#transactions-list .text-danger") !== null })`);
  assert.equal(transactionStyles.income, true, "A bevétel zölden jelenjen meg.");
  assert.equal(transactionStyles.expense, true, "A kiadás pirosan jelenjen meg.");

  await click(devTools, '[data-panel="vat-panel"]');
  await waitFor(devTools, `document.querySelector("#vat-gross-revenue")?.textContent.includes("1")`, "ÁFA panel betöltése");
  assert.match(await devTools.evaluate(`document.querySelector("#vat-margin-total").textContent`), /350/);
  assert.match(await devTools.evaluate(`document.querySelector("#vat-rate-list").innerText`), /Eladott mennyiség: 6 db/);
}

async function main() {
  const profilePath = await fs.mkdtemp(path.join(os.tmpdir(), "store-client-panels-smoke-"));
  const child = spawn(
    electronBinary,
    [
      ...(process.env.ELECTRON_TEST_NO_SANDBOX === "1" ? ["--no-sandbox"] : []),
      "--disable-gpu",
      "--remote-debugging-pipe",
      `--user-data-dir=${profilePath}`,
      ".",
    ],
    { cwd: projectRoot, windowsHide: true, stdio: ["ignore", "pipe", "pipe", "pipe", "pipe"] },
  );
  const output = [];
  child.stdout.on("data", (chunk) => output.push(chunk.toString()));
  child.stderr.on("data", (chunk) => output.push(chunk.toString()));
  const devTools = new DevToolsPipe(child);
  const getOutput = () => output.join("").slice(-3000);

  try {
    const page = await waitForPageTarget(devTools, child, getOutput);
    const attached = await devTools.send("Target.attachToTarget", { targetId: page.targetId, flatten: true });
    devTools.sessionId = attached.sessionId;
    await devTools.send("Runtime.enable", {}, devTools.sessionId);
    await devTools.send("Page.enable", {}, devTools.sessionId);
    await devTools.send("Network.enable", {}, devTools.sessionId);
    await devTools.send("Network.setBlockedURLs", { urls: ["https://cdn.jsdelivr.net/npm/chart.js*"] }, devTools.sessionId);
    await devTools.send("Page.addScriptToEvaluateOnNewDocument", { source: createMockApiScript() }, devTools.sessionId);
    await delay(100);

    await runCashierScenario(devTools);
    await runAdminScenario(devTools);
    await runStockDocumentsScenario(devTools);
    await runStatisticsScenario(devTools);

    console.log("Panel UI próbák sikeresek: kassza/18+, Admin, áruk/PDF-ek és mind az öt statisztikai panel.");
  } finally {
    try { await devTools.send("Browser.close", {}, undefined, 1500); } catch {}
    if (child.exitCode === null) child.kill();
    await Promise.race([new Promise((resolve) => child.once("exit", resolve)), delay(3000)]);
    const resolvedProfile = path.resolve(profilePath);
    if (path.dirname(resolvedProfile) === path.resolve(os.tmpdir())) {
      await fs.rm(resolvedProfile, { recursive: true, force: true });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
