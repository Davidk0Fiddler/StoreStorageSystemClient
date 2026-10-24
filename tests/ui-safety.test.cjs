const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { test } = require("node:test");

const workspaceRoot = path.resolve(__dirname, "..");

async function importBrowserModule(relativePath) {
  const source = await fs.readFile(path.join(workspaceRoot, relativePath), "utf8");
  const encodedSource = Buffer.from(source).toString("base64");
  return import(`data:text/javascript;base64,${encodedSource}`);
}

async function importProductRowRenderer() {
  const sourcePath = path.join(
    workspaceRoot,
    "pages/AddStockPage/ui/product/ProductRow.js",
  );
  const source = await fs.readFile(sourcePath, "utf8");
  const withStubbedImports = source.replace(
    /^import \{ ResolveProductThumbnailUrl \} from .*;\r?\nimport \{ EscapeHtml \} from .*;\r?\n/m,
    `const ResolveProductThumbnailUrl = (thumbnail, image) => thumbnail || image || "";
const EscapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
`,
  );
  assert.notEqual(withStubbedImports, source, "expected product row imports to be replaced");
  return import(
    `data:text/javascript;base64,${Buffer.from(withStubbedImports).toString("base64")}`
  );
}

test("EscapeHtml encodes markup and attribute delimiters", async () => {
  const { EscapeHtml } = await importBrowserModule("pages/shared/Html.js");

  assert.equal(
    EscapeHtml(`<script title="x">O'Neil & Sons</script>`),
    "&lt;script title=&quot;x&quot;&gt;O&#39;Neil &amp; Sons&lt;/script&gt;",
  );
});

test("EscapeHtml handles nullish and ordinary values", async () => {
  const { EscapeHtml } = await importBrowserModule("pages/shared/Html.js");

  assert.equal(EscapeHtml(null), "");
  assert.equal(EscapeHtml(undefined), "");
  assert.equal(EscapeHtml(27), "27");
  assert.equal(EscapeHtml("Sima szöveg"), "Sima szöveg");
});

test("product row renders API text as text and protects attribute values", async () => {
  const { RenderProductRow } = await importProductRowRenderer();
  const attack = `\"><img src=x onerror=alert(1)>`;
  const markup = RenderProductRow({
    productName: attack,
    sku: attack,
    brandName: attack,
    imageURL: attack,
    isActive: true,
  });

  assert.match(markup, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(markup, /<img src=x onerror=alert\(1\)>/);
  assert.doesNotMatch(markup, /data-product-sku="\"><img/);
});

test("AddEventListenerOnce registers one listener per element and key", async () => {
  const { AddEventListenerOnce } = await importBrowserModule(
    "pages/shared/AddEventListenerOnce.js",
  );
  const listeners = new Map();
  const target = {
    addEventListener(eventName, listener) {
      const registered = listeners.get(eventName) ?? [];
      registered.push(listener);
      listeners.set(eventName, registered);
    },
  };
  let callCount = 0;
  const handler = () => callCount++;

  assert.equal(AddEventListenerOnce(target, "click", handler, "save"), true);
  assert.equal(AddEventListenerOnce(target, "click", handler, "save"), false);
  assert.equal(AddEventListenerOnce(target, "click", handler, "cancel"), true);
  assert.equal(listeners.get("click").length, 2);

  listeners.get("click").forEach((listener) => listener());
  assert.equal(callCount, 2);
});

test("AddEventListenerOnce safely ignores a missing target", async () => {
  const { AddEventListenerOnce } = await importBrowserModule(
    "pages/shared/AddEventListenerOnce.js",
  );

  assert.equal(AddEventListenerOnce(null, "click", () => {}), false);
});
