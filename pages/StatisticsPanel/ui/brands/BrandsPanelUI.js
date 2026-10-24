import { FormatNumber } from "../../features/shared/formatters.js";

function renderUnitTotals(totals) {
  return totals.map(({ unit, quantity }) => `${FormatNumber(quantity)} ${unit}`).join(" · ") || "0 db";
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderSummary(report) {
  setText("brands-total-count", FormatNumber(report.totalBrands, 0));
  const totalElement = document.getElementById("brands-total-sales");
  if (totalElement) {
    totalElement.replaceChildren(
      ...report.totalByUnit.map(({ unit, quantity }) => {
        const line = document.createElement("div");
        line.className = "fs-4";
        line.textContent = `${FormatNumber(quantity)} ${unit}`;
        return line;
      }),
    );
    if (!report.totalByUnit.length) totalElement.textContent = "0 db";
  }

  const topList = document.getElementById("brands-top-three");
  if (!topList) return;
  topList.replaceChildren();
  if (!report.topBrands.length) {
    topList.textContent = "Nincs eladási adat";
    return;
  }
  report.topBrands.forEach((brand, index) => {
    const row = document.createElement("div");
    row.className = "d-flex justify-content-between align-items-center gap-2 border-bottom py-2";
    const name = document.createElement("span");
    name.textContent = `${index + 1}. ${brand.name}`;
    const quantity = document.createElement("strong");
    quantity.textContent = renderUnitTotals(brand.totals);
    row.append(name, quantity);
    topList.appendChild(row);
  });
}

function renderBrandDetails(brand) {
  document.getElementById("brand-selected-empty")?.classList.add("d-none");
  document.getElementById("brand-selected")?.classList.remove("d-none");
  setText("selected-brand-name", brand.name);
  setText("selected-brand-sales", renderUnitTotals(brand.totals));

  const productsList = document.getElementById("selected-brand-products");
  if (!productsList) return;
  productsList.replaceChildren();
  if (!brand.products.length) {
    productsList.textContent = "Ehhez a márkához még nincs eladási adat.";
    return;
  }

  for (const product of brand.products) {
    const row = document.createElement("div");
    row.className = "d-flex justify-content-between align-items-start gap-3 border-bottom py-3";
    const name = document.createElement("div");
    name.className = "fw-semibold";
    name.textContent = product.name;
    const quantity = document.createElement("strong");
    quantity.className = "text-nowrap";
    quantity.textContent = `${FormatNumber(product.quantity)} ${product.unit}`;
    row.append(name, quantity);
    productsList.appendChild(row);
  }
}

function renderBrandList(report, searchTerm = "") {
  const list = document.getElementById("brands-list");
  if (!list) return;
  list.replaceChildren();
  const filtered = report.brands.filter((brand) =>
    brand.name.toLocaleLowerCase("hu").includes(searchTerm.trim().toLocaleLowerCase("hu")),
  );

  if (!filtered.length) {
    list.textContent = "Nincs találat";
    return;
  }

  filtered.forEach((brand, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-light border rounded-3 text-start p-3";
    const row = document.createElement("span");
    row.className = "d-flex align-items-center gap-3";
    const rank = document.createElement("strong");
    rank.className = "text-body-secondary";
    rank.textContent = brand.score > 0 ? `#${index + 1}` : "—";
    const name = document.createElement("span");
    name.className = "fw-semibold flex-grow-1";
    name.textContent = brand.name;
    const totals = document.createElement("strong");
    totals.className = "text-end";
    totals.textContent = renderUnitTotals(brand.totals);
    row.append(rank, name, totals);
    button.appendChild(row);
    button.addEventListener("click", () => renderBrandDetails(brand));
    list.appendChild(button);
  });
}

export function InitializeBrandsPanelUI({ getReport, isCurrent = () => true } = {}) {
  const fromPicker = document.getElementById("brands-from");
  const toPicker = document.getElementById("brands-to");
  const search = document.getElementById("brands-search");
  if (!fromPicker || !toPicker) return;
  const today = new Date();
  fromPicker.value = `${today.getFullYear()}-01-01`;
  toPicker.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  let activeReport = null;
  let requestVersion = 0;
  const render = () => {
    if (!activeReport) return;
    renderBrandList(activeReport, search?.value ?? "");
  };
  search?.addEventListener("input", render);

  const load = async () => {
    const from = fromPicker.value;
    const to = toPicker.value;
    const version = ++requestVersion;
    const list = document.getElementById("brands-list");
    if (!from || !to || from > to) {
      if (list) list.textContent = "Adj meg érvényes dátumtartományt.";
      return;
    }
    if (list) list.textContent = "Márkaadatok betöltése…";
    try {
      const report = await getReport(from, to);
      if (version !== requestVersion || !isCurrent()) return;
      activeReport = report;
      renderSummary(report);
      const empty = document.getElementById("brand-selected-empty");
      const selected = document.getElementById("brand-selected");
      empty?.classList.remove("d-none");
      selected?.classList.add("d-none");
      render();
      const topBrand = report.topBrands[0] ?? report.brands[0];
      if (topBrand) renderBrandDetails(topBrand);
    } catch (error) {
      if (version !== requestVersion || !isCurrent()) return;
      console.error("Márka-panel betöltési hiba:", error);
      if (list) list.textContent = "A márkaadatok betöltése nem sikerült.";
    }
  };
  fromPicker.addEventListener("change", load);
  toPicker.addEventListener("change", load);
  load();
  return () => {
    requestVersion++;
    search?.removeEventListener("input", render);
    fromPicker.removeEventListener("change", load);
    toPicker.removeEventListener("change", load);
  };
}
