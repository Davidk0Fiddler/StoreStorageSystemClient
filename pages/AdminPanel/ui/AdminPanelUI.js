import {
  ResolveProductImageUrl,
  ResolveProductThumbnailUrl,
} from "../../shared/ProductImage.js";
import { RenderStockDocumentsSection } from "./StockDocumentsUI.js";
import { RenderExpiredStockBadge } from "../../shared/ExpiredStockBadge.js";


const areas = [
  {
    id: "products",
    title: "Termékek",
    icon: "bi-boxes",
    note: "Katalógusadatok adminisztrátori kezelése.",
  },
  {
    id: "stocks",
    title: "Áruk",
    icon: "bi-box-seam",
    note: "Készlettételek adminisztrátori kezelése.",
  },
  {
    id: "profiles",
    title: "Profilok",
    icon: "bi-people",
    note: "Profilok és hozzáférési állapotok adminisztrációja.",
  },
  {
    id: "logs",
    title: "Logok",
    icon: "bi-journal-text",
    note: "Shoplog, Auditlog és StorageMovingLog áttekintése.",
  },
];

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

const isActiveStatus = (active) =>
  active === true || active === 1 || active === "true";
const activeBadge = (active) => {
  const isActive = isActiveStatus(active);
  return `<span class="admin-status-badge ${isActive ? "is-active" : "is-inactive"}"><i class="bi ${isActive ? "bi-check-circle-fill" : "bi-pause-circle-fill"}" aria-hidden="true"></i>${isActive ? "Aktív" : "Inaktív"}</span>`;
};

function renderHeader(title, back = false) {
  return `
    <header class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <p class="text-primary text-uppercase fw-semibold small mb-1">Admin Page</p>
        <h1 class="h2 fw-bold mb-1" data-window-title>${title}</h1>
      </div>
      ${
        back
          ? `<button class="btn btn-outline-secondary" type="button" data-admin-home><i class="bi bi-arrow-left me-2" aria-hidden="true"></i>Admin panelek</button>`
          : `<a class="btn btn-danger px-4" href="../LandingPage/LandingPage.html"><i class="bi bi-arrow-left me-2" aria-hidden="true"></i>Vissza a menübe</a>`
      }
    </header>`;
}

function renderHome() {
  return `${renderHeader("Admin Panel")}
    <div class="row g-3 g-xl-4">
      ${areas
        .map(
          (area) => `
        <div class="col-12 col-md-6 col-xxl-3">
          <button type="button" class="card admin-card h-100 w-100 border-0 shadow-sm rounded-4 text-start p-0" data-open-admin-panel="${area.id}">
            <span class="card-body d-flex flex-column p-4">
              <span class="admin-card-copy">
                <span class="admin-card-icon mb-3" aria-hidden="true"><i class="bi ${area.icon}"></i></span>
                <span class="h5 fw-bold">${area.title}</span>
                <span class="text-body-secondary">${area.note}</span>
              </span>
              <span class="btn btn-outline-primary mt-auto">Panel megnyitása <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></span>
            </span>
          </button>
        </div>`,
        )
        .join("")}
    </div>
    <section class="admin-note card border-0 rounded-4 mt-4">
      <div class="card-body d-flex align-items-start gap-3 p-4">
        <i class="bi bi-shield-check text-primary fs-4" aria-hidden="true"></i>
        <p class="mb-0 text-body-secondary">A módosító műveletek megerősítést kérnek. Az Admin szerepkört minden végpontnál a backendnek is ellenőriznie kell.</p>
      </div>
    </section>`;
}

function renderSearchToolbar(
  placeholder = "Keresés név, azonosító vagy leírás szerint...",
  value = "",
) {
  return `<div class="d-flex flex-wrap gap-2 mb-3">
    <input class="form-control admin-search" type="search" data-admin-search value="${esc(value)}" placeholder="${placeholder}" />
    <button class="btn btn-outline-primary" type="button" data-admin-refresh><i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>Frissítés</button>
  </div>`;
}

function renderEmptyOrError(state, colspan) {
  if (state.loading)
    return `<tr><td colspan="${colspan}" class="text-center py-5"><span class="spinner-border spinner-border-sm me-2" role="status"></span>Betöltés...</td></tr>`;
  if (state.error)
    return `<tr><td colspan="${colspan}" class="text-center text-danger py-5">${esc(state.error)}</td></tr>`;
  if (!state.items?.length)
    return `<tr><td colspan="${colspan}" class="text-center text-body-secondary py-5">Nincs megjeleníthető adat.</td></tr>`;
  return "";
}

function renderActionButtons(active, identity, canEdit = true) {
  const isActive = isActiveStatus(active);
  return `<div class="admin-row-actions">
    ${canEdit ? `<button class="btn btn-primary admin-touch-button" type="button" data-admin-edit="${esc(identity)}"><i class="bi bi-pencil-square" aria-hidden="true"></i><span>Módosítás</span></button>` : ""}
    <button class="btn ${isActive ? "btn-outline-danger" : "btn-success"} admin-touch-button" type="button" data-admin-toggle="${esc(identity)}" data-admin-active="${isActive}" aria-label="${isActive ? "Deaktiválás" : "Aktiválás"}">
      <i class="bi ${isActive ? "bi-toggle-on" : "bi-toggle-off"}" aria-hidden="true"></i><span>${isActive ? "Deaktiválás" : "Aktiválás"}</span>
    </button>
  </div>`;
}

function renderProducts(state) {
  const rows = (state.items ?? [])
    .map(
      (item) => `
    <tr>
      <td><div class="d-flex align-items-center gap-3"><img class="admin-product-thumbnail rounded-3 border bg-white" data-product-image="true" data-admin-product-thumbnail="${esc(item.sku)}" src="${esc(ResolveProductThumbnailUrl(item.thumbnailURL || item.thumbnailUrl || item.productThumbnailURL || item.productThumbnailUrl, item.imageURL || item.productImageURL))}" alt="" loading="lazy" decoding="async"><div><div class="fw-semibold">${esc(item.productName)}</div><small class="text-body-secondary">${esc(item.barcode)}</small></div></div></td>
      <td>${esc(item.sku)}</td><td>${esc(item.brand)}</td><td>${esc(item.productType)}</td>
      <td>${activeBadge(item.isActive)}</td><td>${renderActionButtons(item.isActive, item.sku)}</td>
    </tr>`,
    )
    .join("");
  const colspan = 6;
  return `${renderHeader("Termékek adminisztrációja", true)}
    <section class="card border-0 shadow-sm rounded-4"><div class="card-body">
      ${renderSearchToolbar(undefined, state.search)}
      <div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead><tr><th>Termék</th><th>SKU</th><th>Márka</th><th>Típus</th><th>Állapot</th><th class="text-center">Kritikus műveletek</th></tr></thead>
      <tbody>${rows || renderEmptyOrError(state, colspan)}</tbody></table></div>
    </div></section>`;
}

function stockItem(stock) {
  return { ...stock, product: stock.product ?? stock };
}

function renderStocks(state) {
  const rows = (state.items ?? [])
    .map(stockItem)
    .map(
      (stock) => `
    <tr>
      <td><div class="fw-semibold">${esc(stock.product.productName)}</div><small class="text-body-secondary">${esc(stock.product.sku)}</small></td>
      <td>${esc(stock.quantity)} ${esc(stock.product.productSize)}</td>
      <td>${esc(stock.shopQuantity ?? "—")} ${esc(stock.product.productSize)}</td>
      <td>${esc(stock.currentPrice)} Ft</td><td>${esc(stock.expirationDate)} ${RenderExpiredStockBadge(stock, "ms-1")}</td>
      <td>${activeBadge(stock.isActive)}</td><td>${renderActionButtons(stock.isActive, stock.stockId)}</td>
    </tr>`,
    )
    .join("");
  const colspan = 7;
  return `${renderHeader("Áruk adminisztrációja", true)}
    <section class="card border-0 shadow-sm rounded-4"><div class="card-body">
      ${renderSearchToolbar(undefined, state.search)}
      <div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead><tr><th>Termék</th><th>Készlet</th><th>Bolti mennyiség</th><th>Eladási ár</th><th>Lejárat</th><th>Állapot</th><th class="text-center">Kritikus műveletek</th></tr></thead>
      <tbody>${rows || renderEmptyOrError(state, colspan)}</tbody></table></div>
    </div></section>`;
}

function renderProfiles(state) {
  const rows = (state.items ?? [])
    .map(
      (profile) => `
    <tr>
      <td class="fw-semibold">${esc(profile.userName)}</td><td>${esc(profile.roleName)}</td>
      <td>${activeBadge(profile.isActive)}</td><td>${esc(profile.createdAt ? new Date(profile.createdAt).toLocaleString("hu-HU") : "—")}</td>
      <td>${renderActionButtons(profile.isActive, profile.userName)}</td>
    </tr>`,
    )
    .join("");
  const colspan = 5;
  return `${renderHeader("Profilok adminisztrációja", true)}
    <section class="card border-0 shadow-sm rounded-4"><div class="card-body">
      ${renderSearchToolbar("Keresés felhasználónév vagy szerepkör szerint...", state.search)}
      <div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead><tr><th>Felhasználónév</th><th>Szerepkör</th><th>Állapot</th><th>Létrehozva</th><th class="text-center">Kritikus műveletek</th></tr></thead>
      <tbody>${rows || renderEmptyOrError(state, colspan)}</tbody></table></div>
    </div></section>`;
}

const logTypes = [
  { id: "shoplog", label: "Shoplog" },
  { id: "auditlog", label: "Auditlog" },
  { id: "storagemovinglog", label: "StorageMovingLog" },
];

const logColumns = {
  shoplog: [
    ["id", "Azonosító"],
    ["dateTime", "Vásárlás ideje"],
    ["userName", "Pénztáros"],
    ["productsCount", "Tételek"],
    ["totalPrice", "Végösszeg"],
  ],
  auditlog: [
    ["id", "Azonosító"],
    ["createdAt", "Művelet ideje"],
    ["userName", "Végrehajtó"],
    ["action", "Művelet"],
  ],
  storagemovinglog: [
    ["id", "Azonosító"],
    ["createdAt", "Mozgatás ideje"],
    ["userName", "Végrehajtó"],
    ["productName", "Termék"],
    ["quantity", "Mennyiség"],
    ["unit", "Mértékegység"],
  ],
};

const logLabels = {
  id: "Azonosító",
  logId: "Azonosító",
  shopLogId: "Shoplog azonosító",
  createdAt: "Rögzítés ideje",
  dateTime: "Dátum és idő",
  timestamp: "Időpont",
  userName: "Felhasználó",
  actorUserName: "Végrehajtó",
  performedBy: "Végrehajtó",
  action: "Művelet",
  eventType: "Eseménytípus",
  entityType: "Adattípus",
  entityId: "Érintett azonosító",
  description: "Leírás",
  Description: "Leírás",
  OldValues: "Módosítás előtt",
  NewValues: "Módosítás után",
  productName: "Termék",
  sku: "SKU",
  stockId: "Áru azonosító",
  productsCount: "Tételek száma",
  totalPrice: "Végösszeg",
  quantity: "Mennyiség",
  unit: "Mértékegység",
  before: "Módosítás előtt",
  after: "Módosítás után",
  products: "Termékek",
  productSize: "Termékméret",
  currentPrice: "Eladási ár",
  importPrice: "Beszerzési ár",
};

function readLogField(item, field) {
  const aliases = {
    id: ["id", "logId", "shopLogId"],
    dateTime: ["dateTime", "createdAt", "timestamp"],
    createdAt: ["createdAt", "dateTime", "timestamp"],
    userName: ["userName", "actorUserName", "performedBy"],
    actorUserName: ["actorUserName", "userName", "performedBy"],
    quantity: ["quantity"],
  };
  for (const key of aliases[field] ?? [field]) {
    if (item[key] !== undefined && item[key] !== null) return item[key];
  }
  return null;
}

function formatLogValue(value, key = "") {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Igen" : "Nem";
  if (Array.isArray(value))
    return value.map((item) => formatLogValue(item)).join(", ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(
        ([childKey, childValue]) =>
          `${logLabels[childKey] ?? childKey}: ${formatLogValue(childValue, childKey)}`,
      )
      .join(" · ");
  }
  if (["dateTime", "createdAt", "timestamp"].includes(key)) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleString("hu-HU");
  }
  if (
    ["totalPrice", "currentPrice", "importPrice", "depositAmount"].includes(
      key,
    ) &&
    Number.isFinite(Number(value))
  ) {
    return `${new Intl.NumberFormat("hu-HU").format(Number(value))} Ft`;
  }
  return String(value);
}

function prettyKey(key) {
  return (
    logLabels[key] ??
    key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (letter) => letter.toUpperCase())
  );
}

function renderLogs(state) {
  const columns = logColumns[state.logType] ?? logColumns.shoplog;
  const rows = (state.items ?? [])
    .map((item) => {
      const identity = readLogField(item, "id");
      const cells = columns
        .map(
          ([field]) =>
            `<td>${esc(formatLogValue(readLogField(item, field), field))}</td>`,
        )
        .join("");
      return `<tr>${cells}<td class="text-end"><button class="btn btn-sm btn-outline-primary" type="button" data-log-detail="${esc(identity)}"><i class="bi bi-card-text me-1" aria-hidden="true"></i>Részletek</button></td></tr>`;
    })
    .join("");
  const colspan = columns.length + 1;
  return `${renderHeader("Logok áttekintése", true)}
    <section class="card border-0 shadow-sm rounded-4"><div class="card-body">
      <nav class="nav nav-pills gap-2 mb-3" aria-label="Naplótípus kiválasztása">
        ${logTypes.map((item) => `<button class="nav-link ${state.logType === item.id ? "active" : ""}" type="button" data-log-type="${item.id}">${item.label}</button>`).join("")}
      </nav>
      <div class="d-flex flex-wrap align-items-end gap-2 mb-3">
        <label class="small">Kezdő dátum<input type="date" class="form-control" data-log-from value="${esc(state.from)}"></label>
        <label class="small">Záró dátum<input type="date" class="form-control" data-log-to value="${esc(state.to)}"></label>
        <button class="btn btn-primary" type="button" data-admin-refresh><i class="bi bi-funnel me-1" aria-hidden="true"></i>Szűrés</button>
        <span class="badge text-bg-secondary ms-auto">${state.total ?? state.items?.length ?? 0} bejegyzés</span>
      </div>
      <div class="table-responsive"><table class="table table-hover align-middle mb-0 w-100"><thead><tr>${columns.map(([, label]) => `<th>${label}</th>`).join("")}<th></th></tr></thead>
      <tbody>${rows || renderEmptyOrError(state, colspan)}</tbody></table></div>
      <div class="d-flex justify-content-between mt-3"><button class="btn btn-outline-secondary btn-sm" data-log-page="prev" ${state.page <= 1 ? "disabled" : ""}>Előző</button><span>${state.page} / ${state.pageCount ?? 1}</span><button class="btn btn-outline-secondary btn-sm" data-log-page="next" ${state.page >= (state.pageCount ?? 1) ? "disabled" : ""}>Következő</button></div>
    </div></section>`;
}

export function RenderAdminPanel(panelId = null, state = {}) {
  if (panelId === "products") return renderProducts(state);
  if (panelId === "stocks") return renderStocks(state);
  if (panelId === "profiles") return renderProfiles(state);
  if (panelId === "logs") return renderLogs(state);
  return renderHome();
}

const editorDefinitions = {
  products: {
    title: "Termékadatok felülírása",
    icon: "bi-box-seam",
    fields: (item) => [
      [
        "productName",
        "Terméknév",
        item.productName,
        "text",
        "A termék neve, ahogy a pénztárban és a készletben megjelenik.",
        "bi-tag",
        true,
      ],
      [
        "barcode",
        "Vonalkód",
        item.barcode,
        "text",
        "A termék egyedi, beolvasással használt vonalkódja.",
        "bi-upc-scan",
        true,
      ],
      [
        "brand",
        "Márka",
        item.brand,
        "text",
        "A termékhez rendelt márka neve.",
        "bi-bookmark",
        false,
      ],
      [
        "productType",
        "Terméktípus",
        item.productType,
        "text",
        "A termék kategóriája.",
        "bi-grid",
        false,
      ],
      [
        "productSize",
        "Mértékegység",
        item.productSize,
        "text",
        "Például db, kg vagy liter.",
        "bi-rulers",
        false,
      ],
      [
        "hasDeposit",
        "Betétdíjas termék",
        item.hasDeposit,
        "checkbox",
        "Jelöld be, ha a termékhez betétdíj tartozik.",
        "bi-recycle",
        false,
      ],
      [
        "depositAmount",
        "Betétdíj (Ft)",
        item.depositAmount,
        "number",
        "A termékhez tartozó betétdíj összege.",
        "bi-currency-exchange",
        false,
      ],
      [
        "canBePurchasedByMinors",
        "18 év alattiak is megvásárolhatják",
        item.canBePurchasedByMinors !== false,
        "checkbox",
        "Kapcsold ki, ha a terméket csak 18 éven felüli vásárló veheti meg.",
        "bi-person-lock",
        false,
      ],
    ],
  },
  stocks: {
    title: "Áruadatok felülírása",
    icon: "bi-boxes",
    fields: (item) => {
      const stock = stockItem(item);
      return [
        [
          "quantity",
          "Raktári mennyiség",
          stock.quantity,
          "number",
          "A teljes raktári készlet mennyisége.",
          "bi-boxes",
          true,
        ],
        [
          "shopQuantity",
          "Bolti mennyiség",
          stock.shopQuantity,
          "number",
          "Az üzlettérben elérhető mennyiség.",
          "bi-shop",
          false,
        ],
        [
          "currentPrice",
          "Eladási ár (Ft)",
          stock.currentPrice,
          "number",
          "A vásárlók által fizetendő aktuális ár.",
          "bi-cash-coin",
          true,
        ],
        [
          "importPrice",
          "Beszerzési ár (Ft)",
          stock.importPrice,
          "number",
          "A beszerzéskor rögzített egységár.",
          "bi-receipt",
          false,
        ],
        [
          "expirationDate",
          "Lejárati dátum",
          String(stock.expirationDate ?? "").slice(0, 10),
          "date",
          "A tétel lejárati dátuma.",
          "bi-calendar-event",
          false,
        ],
        [
          "invoiceId",
          "Számlaazonosító",
          stock.invoiceId,
          "text",
          "A kapcsolódó számla vagy bizonylat azonosítója.",
          "bi-receipt-cutoff",
          false,
        ],
        [
          "transitId",
          "Szállítmányazonosító",
          stock.transitId,
          "text",
          "A kapcsolódó szállítmány azonosítója.",
          "bi-truck",
          false,
        ],
      ];
    },
  },
  profiles: {
    title: "Profiladatok felülírása",
    icon: "bi-person-gear",
    fields: (item) => [
      [
        "userName",
        "Felhasználónév",
        item.userName,
        "text",
        "A felhasználó bejelentkezési neve.",
        "bi-person",
        true,
      ],
      [
        "roleId",
        "Szerepkör",
        item.roleId,
        "select",
        "A profilhoz rendelt rendszerjogosultság.",
        "bi-shield-lock",
        true,
      ],
    ],
  },
};

function renderEditorField(
  [name, label, value, type, hint, icon, required],
  item,
) {
  const id = `admin-edit-${name}`;
  const tooltip = `<button class="btn btn-outline-secondary admin-help-button" type="button" data-bs-toggle="tooltip" data-bs-title="${esc(hint)}" aria-label="${esc(label)} – súgó"><i class="bi bi-question-circle" aria-hidden="true"></i></button>`;

  if (type === "checkbox") {
    return `<div class="col-12"><div class="admin-switch-card form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" name="${name}" id="${id}" ${value ? "checked" : ""}>
      <label class="form-check-label fw-semibold" for="${id}"><i class="bi ${icon} me-2 text-primary" aria-hidden="true"></i>${esc(label)}</label>
      ${tooltip}<small class="d-block text-body-secondary ms-5 mt-1">${esc(hint)}</small>
    </div></div>`;
  }

  if (type === "file") {
    return `<div class="col-12"><label class="form-label fw-semibold" for="${id}">${esc(label)}</label>
      <div class="d-flex flex-column flex-sm-row align-items-sm-center gap-3">
        <img class="admin-product-image-preview rounded-3 border bg-white" data-product-image="true" data-admin-product-image-preview data-original-src="${esc(ResolveProductImageUrl(value))}" src="${esc(ResolveProductImageUrl(value))}" alt="${esc(item.productName ?? "Termékkép")}" loading="eager" decoding="async">
        <div class="flex-grow-1"><input class="form-control" id="${id}" type="file" data-admin-product-image accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,image/jpeg,image/png,image/gif,image/webp,image/bmp">
          <div class="form-text">JPG, PNG, GIF, WebP vagy BMP; legfeljebb 10 MB.</div>
          <button class="btn btn-outline-primary mt-2" type="button" data-admin-product-image-upload><i class="bi bi-cloud-arrow-up me-2" aria-hidden="true"></i>Kép feltöltése</button>
          <div class="progress d-none mt-3" data-admin-image-progress role="progressbar" aria-label="Termékkép feltöltése" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="progress-bar progress-bar-striped progress-bar-animated" data-admin-image-progress-bar style="width:0%"></div></div>
          <div class="small mt-2" data-admin-product-image-status role="status" aria-live="polite"></div></div>
        <input type="hidden" name="imageURL" value="${esc(value ?? "")}">
      </div>
    </div>`;
  }

  let control;
  if (type === "select") {
    const roles = [
      [1, "Admin"],
      [2, "Counter"],
      [3, "Storage"],
    ];
    control = `<select class="form-select" name="${name}" id="${id}" required>${roles
      .map(([roleId, roleName]) => {
        const selected =
          Number(value) === roleId || (!value && item.roleName === roleName);
        return `<option value="${roleId}" ${selected ? "selected" : ""}>${roleName}</option>`;
      })
      .join("")}</select>`;
  } else {
    const requiredAttribute = required ? "required" : "";
    const min = type === "number" ? "min='0' step='any'" : "";
    control = `<input class="form-control" name="${name}" id="${id}" type="${type}" value="${esc(value)}" ${requiredAttribute} ${min}>`;
  }

  return `<div class="col-12 col-md-6"><label class="form-label fw-semibold" for="${id}">${esc(label)}</label>
    <div class="input-group"><span class="input-group-text"><i class="bi ${icon} text-primary" aria-hidden="true"></i></span>${control}${tooltip}</div>
  </div>`;
}

export function RenderAdminEditModal(kind, item) {
  const definition = editorDefinitions[kind];
  if (!definition) return "";
  const stock = kind === "stocks" ? stockItem(item) : item;
  const identity =
    kind === "products"
      ? item.sku
      : kind === "stocks"
        ? stock.stockId
        : item.userName;
  const productImageField = kind === "products"
    ? renderEditorField([
        "productImage",
        "Termékkép",
        item.imageURL || item.productImageURL || "",
        "file",
        "Tölts fel új termékképet. Ha nem választasz fájlt, a jelenlegi kép marad.",
        "bi-image",
        false,
      ], item)
    : "";
  const fields = definition
    .fields(item)
    .map((field) => renderEditorField(field, item))
    .join("") + productImageField;
  const stockDocuments =
    kind === "stocks" ? RenderStockDocumentsSection(stock.stockId) : "";

  return `<div class="modal fade" id="admin-edit-modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"><div class="modal-content admin-editor-modal border-0 rounded-4 shadow-lg">
      <div class="modal-header admin-editor-header border-0">
        <div class="d-flex align-items-center gap-3"><span class="admin-editor-icon"><i class="bi ${definition.icon}" aria-hidden="true"></i></span><div>
          <h2 class="modal-title h5 fw-bold mb-1">${definition.title}</h2>
          <p class="mb-0 small text-body-secondary">Azonosító: <span class="font-monospace fw-semibold">${esc(identity)}</span></p>
        </div></div>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Bezárás"></button>
      </div>
      <form data-admin-edit-form data-admin-kind="${kind}" data-admin-id="${esc(identity)}">
        <div class="modal-body pt-2"><div class="row g-3">${fields}${stockDocuments}</div>
          <div class="admin-audit-hint mt-4"><i class="bi bi-shield-check me-2" aria-hidden="true"></i>A mentett változtatás auditnaplóba kerül.</div>
        </div>
        <div class="modal-footer border-0 pt-0"><button class="btn btn-light border" type="button" data-bs-dismiss="modal">Mégse</button>
          <button class="btn btn-primary px-4" type="submit"><i class="bi bi-check2-circle me-2" aria-hidden="true"></i>Felülírás mentése</button>
        </div>
      </form>
    </div></div></div>`;
}

export function RenderAdminConfirmModal({
  title,
  message,
  icon,
  confirmLabel,
  danger,
}) {
  const color = danger ? "danger" : "primary";
  return `<div class="modal fade" id="admin-confirm-modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered"><div class="modal-content admin-confirm-modal border-0 rounded-4 shadow-lg">
      <div class="modal-body text-center p-4 p-md-5">
        <div class="admin-confirm-icon text-${color} bg-${color}-subtle mb-3"><i class="bi ${icon}" aria-hidden="true"></i></div>
        <h2 class="h4 fw-bold mb-2">${esc(title)}</h2>
        <p class="text-body-secondary mb-4">${esc(message).replace(/\n/g, "<br>")}</p>
        <div class="d-flex justify-content-center gap-2"><button class="btn btn-light border px-4" type="button" data-bs-dismiss="modal">Mégse</button>
          <button class="btn btn-${color} px-4" type="button" data-confirm-action>${esc(confirmLabel)}</button></div>
      </div>
    </div></div></div>`;
}

export function RenderAdminNoticeModal(type, title, message) {
  const isError = type === "danger";
  const color = isError ? "danger" : "success";
  return `<div class="modal fade" id="admin-notice-modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered"><div class="modal-content border-0 rounded-4 shadow-lg">
      <div class="modal-body text-center p-4"><div class="admin-confirm-icon text-${color} bg-${color}-subtle mb-3"><i class="bi ${isError ? "bi-exclamation-triangle" : "bi-check2-circle"}" aria-hidden="true"></i></div>
        <h2 class="h5 fw-bold">${esc(title)}</h2><p class="text-body-secondary">${esc(message)}</p>
        <button class="btn btn-${color} px-4" type="button" data-bs-dismiss="modal">Rendben</button>
      </div>
    </div></div></div>`;
}

export function RenderAdminLogDetails(kind, item) {
  const columns = logColumns[kind] ?? [];
  const preferred = columns.map(([key]) => key);
  const descriptionKey =
    kind === "auditlog"
      ? Object.keys(item).find((key) => key.toLowerCase() === "description")
      : null;
  const remaining = Object.keys(item).filter(
    (key) => !preferred.includes(key) && key !== descriptionKey,
  );
  const storageMovingFields = new Set([
    "id",
    "createdat",
    "username",
    "productname",
    "stockid",
    "quantity",
    "unit",
  ]);
  const fields = [...preferred, ...remaining].filter(
    (key) =>
      item[key] !== undefined &&
      item[key] !== null &&
      (kind !== "storagemovinglog" || storageMovingFields.has(key.toLowerCase())),
  );
  const details = fields
    .map(
      (key) =>
        `<div class="col-12 col-md-6"><div class="admin-log-detail h-100"><div class="small text-body-secondary mb-1">${esc(prettyKey(key))}</div><div class="fw-semibold text-break">${esc(formatLogValue(item[key], key))}</div></div></div>`,
    )
    .join("");

  const description =
    kind === "auditlog"
      ? `<div class="col-12"><div class="admin-log-detail h-100"><div class="small text-body-secondary mb-1">Leírás</div><div class="fw-semibold text-break">${esc(formatLogValue(descriptionKey ? item[descriptionKey] : null, "description"))}</div></div></div>`
      : "";
  const title =
    logTypes.find((logType) => logType.id === kind)?.label ?? "Naplóbejegyzés";

  return `<div class="modal fade" id="admin-log-details-modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable"><div class="modal-content border-0 rounded-4 shadow-lg">
      <div class="modal-header border-0"><div><p class="text-primary text-uppercase small fw-semibold mb-1">${esc(title)}</p><h2 class="modal-title h5 fw-bold">Naplóbejegyzés részletei</h2></div><button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Bezárás"></button></div>
      <div class="modal-body pt-0"><div class="row g-2">${details}${description}${details || description ? "" : "<p class='text-body-secondary'>Nincs részletes adat.</p>"}</div></div>
      <div class="modal-footer border-0"><button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">Bezárás</button></div>
    </div></div></div>`;
}


