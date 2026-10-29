const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const workspaceRoot = path.resolve(__dirname, "..");

async function createCartFeatureHarness(initialProducts = []) {
  const sourcePath = path.join(
    workspaceRoot,
    "pages/CounterPage/features/cart/CartFeature.js",
  );
  let source = await fs.readFile(sourcePath, "utf8");
  source = source.replace(/^import\b[\s\S]*?\bfrom\s+["'][^"']+["'];\r?\n/gm, "");
  source = source.replace(/\bexport\s+(?=async\s+function|function)/g, "");
  source += `\nglobalThis.__cartFeature = { RemoveFromCart, DecreaseQuantity, ClearSelectedProducts };`;

  const products = [...initialProducts];
  let buyerAgeStatus = "adult";
  let resetCount = 0;
  const context = {
    GetCartProducts: () => products,
    RemoveProductFromCart: (index) => products.splice(index, 1),
    ClearCart: () => products.splice(0, products.length),
    DecreaseProductQuantity: (index, amount) => {
      if (!products[index]) return;
      products[index].amount -= amount;
      if (products[index].amount <= 0) products.splice(index, 1);
    },
    ResetBuyerAgeStatus: () => {
      buyerAgeStatus = null;
      resetCount++;
    },
    GetCartList: () => null,
    globalThis: null,
  };
  context.globalThis = context;
  vm.runInNewContext(source, context, { filename: sourcePath });

  return {
    feature: context.__cartFeature,
    products,
    get buyerAgeStatus() { return buyerAgeStatus; },
    get resetCount() { return resetCount; },
  };
}

async function createCheckoutSaveHarness(response) {
  const sourcePath = path.join(
    workspaceRoot,
    "pages/CounterPage/features/checkout/CheckoutFeature.js",
  );
  const source = await fs.readFile(sourcePath, "utf8");
  const saveCheckoutDeclaration = source.match(
    /export async function SaveCheckout\(\) \{[\s\S]*?\n\}/,
  )?.[0];
  assert.ok(saveCheckoutDeclaration, "SaveCheckout függvény megtalálható");

  const events = [];
  const context = {
    GetProductsForCheckout: () => [{ product: { sku: "test" }, amount: 1 }],
    SaveCheckoutPurchase: async () => response,
    DisplayAlert: (type, message) => events.push(["alert", type, message]),
    ResetBuyerAgeStatus: () => events.push(["reset-age"]),
    ClearSelectedProducts: () => events.push(["clear-cart"]),
    ClearCheckoutData: () => events.push(["clear-checkout"]),
    globalThis: null,
  };
  context.globalThis = context;

  vm.runInNewContext(
    `${saveCheckoutDeclaration.replace(/^export\s+/, "")}\nglobalThis.__saveCheckout = SaveCheckout;`,
    context,
    { filename: sourcePath },
  );

  return { save: () => context.__saveCheckout(), events };
}

async function createBuyerAgePolicyHarness(initialStatus = null, decision = null) {
  const sourcePath = path.join(
    workspaceRoot,
    "pages/CounterPage/features/cashier/CashierFeature.js",
  );
  const source = await fs.readFile(sourcePath, "utf8");
  const minorPurchaseCheck = source.match(
    /function productCanBePurchasedByMinors\(product\) \{[\s\S]*?\n\}/,
  )?.[0];
  const buyerPurchaseCheck = source.match(
    /async function EnsureBuyerCanPurchase\(product\) \{[\s\S]*?\n\}/,
  )?.[0];
  assert.ok(minorPurchaseCheck && buyerPurchaseCheck, "korhatár-ellenőrző függvények megtalálhatók");

  let buyerAgeStatus = initialStatus;
  let agePromptCount = 0;
  const alerts = [];
  const context = {
    GetBuyerAgeStatus: () => buyerAgeStatus,
    SetBuyerAgeStatus: (value) => { buyerAgeStatus = value; },
    AskBuyerAge: async () => {
      agePromptCount++;
      return decision;
    },
    DisplayAlert: (...args) => alerts.push(args),
    globalThis: null,
  };
  context.globalThis = context;

  vm.runInNewContext(
    `${minorPurchaseCheck}\n${buyerPurchaseCheck}\nglobalThis.__checkBuyer = EnsureBuyerCanPurchase;`,
    context,
    { filename: sourcePath },
  );

  return {
    check: (product) => context.__checkBuyer(product),
    get buyerAgeStatus() { return buyerAgeStatus; },
    get agePromptCount() { return agePromptCount; },
    alerts,
  };
}

test("buyer age approval clears when the last cart item is removed", async () => {
  const harness = await createCartFeatureHarness([{ amount: 1 }]);

  harness.feature.RemoveFromCart(0);

  assert.equal(harness.products.length, 0);
  assert.equal(harness.buyerAgeStatus, null);
  assert.equal(harness.resetCount, 1);
});

test("buyer age approval clears when decreasing the last quantity empties the cart", async () => {
  const harness = await createCartFeatureHarness([
    { amount: 0.05, product: { productSize: "kg" } },
  ]);

  harness.feature.DecreaseQuantity(0, 0.05);

  assert.equal(harness.products.length, 0);
  assert.equal(harness.buyerAgeStatus, null);
  assert.equal(harness.resetCount, 1);
});

test("buyer age approval stays during the same cart session", async () => {
  const harness = await createCartFeatureHarness([{ amount: 1 }, { amount: 1 }]);

  harness.feature.RemoveFromCart(0);

  assert.equal(harness.products.length, 1);
  assert.equal(harness.buyerAgeStatus, "adult");
  assert.equal(harness.resetCount, 0);
});

test("a minor is blocked from restricted products, including later attempts", async () => {
  const harness = await createBuyerAgePolicyHarness(null, "minor");
  const restrictedProduct = { canBePurchasedByMinors: false };

  assert.equal(await harness.check(restrictedProduct), false);
  assert.equal(harness.buyerAgeStatus, "minor");
  assert.equal(await harness.check(restrictedProduct), false);
  assert.equal(harness.agePromptCount, 1);
  assert.equal(harness.alerts.length, 2);
});

test("an adult confirmation permits restricted products for the current buyer", async () => {
  const harness = await createBuyerAgePolicyHarness(null, "adult");
  const restrictedProduct = { canBePurchasedByMinors: "false" };

  assert.equal(await harness.check(restrictedProduct), true);
  assert.equal(harness.buyerAgeStatus, "adult");
  assert.equal(await harness.check(restrictedProduct), true);
  assert.equal(harness.agePromptCount, 1);
});

test("products with the default or explicit minors-allowed flag do not prompt", async () => {
  const harness = await createBuyerAgePolicyHarness();

  assert.equal(await harness.check({}), true);
  assert.equal(await harness.check({ canBePurchasedByMinors: true }), true);
  assert.equal(harness.agePromptCount, 0);
});

test("successful checkout resets buyer age approval and clears the cart", async () => {
  const harness = await createCheckoutSaveHarness({ success: true });

  assert.equal(await harness.save(), true);
  assert.deepEqual(harness.events.map(([event]) => event), [
    "alert",
    "reset-age",
    "clear-cart",
    "clear-checkout",
  ]);
});

test("failed checkout keeps the current buyer age approval and cart", async () => {
  const harness = await createCheckoutSaveHarness({ success: false, error: "Sikertelen mentés" });

  assert.equal(await harness.save(), false);
  assert.deepEqual(harness.events.map(([event]) => event), ["alert"]);
});
