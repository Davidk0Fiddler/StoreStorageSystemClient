let chart;
let version = 0;

const formatMoney = (value) => value === null || value === undefined
  ? "Nincs adat"
  : `${Math.round(value).toLocaleString("hu-HU")} Ft`;
const monthValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderRates(rates) {
  const list = document.getElementById("vat-rate-list");
  const empty = document.getElementById("vat-empty-state");
  if (!list || !empty) return;
  list.replaceChildren();
  empty.classList.toggle("d-none", rates.length > 0);
  for (const rate of rates) {
    const card = document.createElement("div");
    card.className = "border rounded-4 p-3";
    const top = document.createElement("div");
    top.className = "d-flex justify-content-between align-items-center mb-2";
    const rateBadge = document.createElement("span");
    rateBadge.className = "badge text-bg-primary rounded-pill";
    rateBadge.textContent = rate.rate === null ? "Nincs rögzített kulcs" : `${rate.rate}% ÁFA`;
    top.append(rateBadge);
    const salesVat = document.createElement("div");
    salesVat.className = "d-flex justify-content-between small";
    const salesLabel = document.createElement("span");
    salesLabel.className = "text-body-secondary";
    salesLabel.textContent = "Értékesítési ÁFA";
    const salesValue = document.createElement("strong");
    salesValue.textContent = formatMoney(Number(rate.rate) === 0 ? 0 : rate.salesVatAmount);
    salesVat.append(salesLabel, salesValue);
    const quantities = Object.entries(rate.soldQuantities ?? {})
      .filter(([, quantity]) => quantity > 0)
      .map(([unit, quantity]) => `${quantity.toLocaleString("hu-HU")} ${unit}`)
      .join(" · ") || "Mennyiség nincs a riportban";
    const quantityLine = document.createElement("div");
    quantityLine.className = "small text-body-secondary mt-2";
    quantityLine.textContent = `Eladott mennyiség: ${quantities}`;
    card.append(top, salesVat, quantityLine);
    list.append(card);
  }
}

function renderChart(revenue, outputVat, expense, profit) {
  const canvas = document.getElementById("vat-chart");
  if (!canvas) return;
  chart?.destroy();
  chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Bruttó bevétel", "Bevétel felosztása"],
      datasets: [
        { label: "Bruttó bevétel", data: [revenue, 0], backgroundColor: "#198754", borderRadius: 8, stack: "amounts" },
        { label: "Kiadás", data: [0, expense], backgroundColor: "#dc3545", borderRadius: 8, stack: "amounts" },
        { label: "Profit / árrés", data: [0, profit], backgroundColor: "#fd7e14", borderRadius: 8, stack: "amounts" },
        { label: "ÁFA", data: [0, outputVat], backgroundColor: "#0d6efd", borderRadius: 8, stack: "amounts" },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${formatMoney(context.raw)}` } } },
      scales: {
        x: { stacked: true, grid: { display: false } },
        y: { stacked: true, beginAtZero: true, ticks: { callback: (value) => `${Number(value).toLocaleString("hu-HU")} Ft` } },
      },
    },
  });
}

async function load(month, getReport, isCurrent) {
  const currentVersion = ++version;
  setText("vat-gross-revenue", "Betöltés…");
  setText("vat-margin-total", "Betöltés…");
  const marginCard = document.getElementById("vat-margin-card");
  marginCard?.classList.remove("bg-danger-subtle", "text-danger", "bg-body-tertiary", "text-body-secondary", "bg-primary-subtle", "text-primary", "bg-success-subtle", "text-success");
  marginCard?.classList.add("bg-warning-subtle", "text-warning-emphasis");
  setText("vat-output-total", "Betöltés…");
  try {
    const report = await getReport(month);
    if (currentVersion !== version || !isCurrent()) return;
    setText("vat-gross-revenue", formatMoney(report.grossRevenue));
    setText("vat-margin-total", report.grossProfit === null ? "Nem érhető el" : formatMoney(report.grossProfit));
    const hasMargin = report.grossProfit !== null;
    const isLoss = hasMargin && report.grossProfit < 0;
    marginCard?.classList.toggle("bg-danger-subtle", isLoss);
    marginCard?.classList.toggle("text-danger", isLoss);
    marginCard?.classList.toggle("bg-warning-subtle", hasMargin && !isLoss);
    marginCard?.classList.toggle("text-warning-emphasis", hasMargin && !isLoss);
    marginCard?.classList.toggle("bg-body-tertiary", !hasMargin);
    marginCard?.classList.toggle("text-body-secondary", !hasMargin);
    setText("vat-output-total", report.outputVat === null ? "Nem érhető el" : formatMoney(report.outputVat));
    renderRates(report.rates);
    renderChart(report.grossRevenue, report.outputVat, report.expenseAmount, report.grossProfit);
  } catch (error) {
    if (currentVersion !== version || !isCurrent()) return;
    console.error("ÁFA-panel betöltési hiba:", error);
    setText("vat-gross-revenue", "–");
    setText("vat-margin-total", "–");
    marginCard?.classList.remove("bg-warning-subtle", "text-warning-emphasis", "bg-danger-subtle", "text-danger", "bg-primary-subtle", "text-primary", "bg-success-subtle", "text-success");
    marginCard?.classList.add("bg-body-tertiary", "text-body-secondary");
    setText("vat-output-total", "–");
    const list = document.getElementById("vat-rate-list");
    if (list) list.textContent = "Az ÁFA-adatok betöltése nem sikerült.";
    renderChart(0, 0, 0, 0);
  }
}

export function InitializeVatPanelUI({ getReport, isCurrent = () => true } = {}) {
  const picker = document.getElementById("vat-month");
  if (!picker) return;
  picker.value = monthValue(new Date());
  const onChange = () => load(picker.value, getReport, isCurrent);
  picker.addEventListener("change", onChange);
  onChange();
  return () => {
    version++;
    picker.removeEventListener("change", onChange);
    chart?.destroy();
    chart = null;
  };
}
