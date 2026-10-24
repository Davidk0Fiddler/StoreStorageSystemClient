let chart;
let requestVersion = 0;

const money = (value) => value === null || value === undefined ? "Nincs adat" : `${Math.round(value).toLocaleString("hu-HU")} Ft`;
const monthValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function renderTransactions(transactions) {
  const list = document.getElementById("transactions-list");
  if (!list) return;
  list.replaceChildren();
  if (!transactions.length) {
    const empty = document.createElement("div");
    empty.className = "text-body-secondary text-center py-5";
    empty.textContent = "Ebben a hónapban nem történt tranzakció.";
    list.append(empty);
    return;
  }
  for (const transaction of transactions) {
    const income = transaction.type === "income";
    const row = document.createElement("div");
    row.className = "border rounded-4 p-3";
    const layout = document.createElement("div");
    layout.className = "d-flex align-items-center justify-content-between gap-3";
    const info = document.createElement("div");
    info.className = "d-flex align-items-center gap-3 min-w-0";
    const icon = document.createElement("div");
    icon.className = `rounded-3 p-2 ${income ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`;
    icon.innerHTML = `<i class="bi ${income ? "bi-cart-check" : "bi-box-arrow-in-down"}"></i>`;
    const titleArea = document.createElement("div");
    titleArea.className = "text-truncate";
    const title = document.createElement("div");
    title.className = "fw-semibold text-truncate";
    title.textContent = transaction.title;
    const detail = document.createElement("small");
    detail.className = "text-body-secondary";
    detail.textContent = `${transaction.date.toLocaleString("hu-HU")} · ${transaction.detail}`;
    titleArea.append(title, detail);
    info.append(icon, titleArea);
    const value = document.createElement("div");
    value.className = `fw-bold text-nowrap ${income ? "text-success" : "text-danger"}`;
    value.textContent = transaction.amount === null
      ? "Nincs adat"
      : `${income ? "+" : "−"}${money(transaction.amount)}`;
    layout.append(info, value);
    row.append(layout);
    list.append(row);
  }
}

function renderChart(daily, month) {
  const canvas = document.getElementById("transactions-chart");
  if (!canvas) return;
  chart?.destroy();
  const [year, monthNumber] = month.split("-").map(Number);
  const days = new Date(year, monthNumber, 0).getDate();
  const labels = Array.from({ length: days }, (_, index) => String(index + 1));
  const keys = labels.map((day) => `${month}-${day.padStart(2, "0")}`);
  chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Bevétel", data: keys.map((key) => daily.get(key)?.income ?? 0), backgroundColor: "#198754", borderRadius: 5 },
        { label: "Kiadás", data: keys.map((key) => daily.has(key) ? daily.get(key).expenses : 0), backgroundColor: "#dc3545", borderRadius: 5 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" }, tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${money(context.raw)}` } } },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { callback: (value) => `${Number(value).toLocaleString("hu-HU")} Ft` } } },
    },
  });
}

export async function LoadTransactionsPanel(month, getReport, isCurrent) {
  const version = ++requestVersion;
  setText("transactions-period-label", month);
  setText("transactions-income", "Betöltés…");
  setText("transactions-expenses", "Betöltés…");
  const list = document.getElementById("transactions-list");
  if (list) list.textContent = "Tranzakciók betöltése…";
  try {
    const report = await getReport(month);
    if (version !== requestVersion || !isCurrent()) return;
    setText("transactions-income", money(report.income));
    setText("transactions-income-count", `${report.transactions.filter((item) => item.type === "income").length} értékesítés`);
    setText("transactions-expenses", money(report.expenses));
    setText("transactions-expense-count", `${report.transactions.filter((item) => item.type === "expense").length} beszerzés`);
    renderTransactions(report.transactions);
    renderChart(report.daily, month);
  } catch (error) {
    if (version !== requestVersion || !isCurrent()) return;
    console.error("Tranzakciós panel betöltési hiba:", error);
    if (list) list.textContent = "A tranzakciók betöltése nem sikerült.";
    setText("transactions-income", "–");
    setText("transactions-expenses", "–");
  }
}

export function InitializeTransactionsPanelUI({ getReport, isCurrent = () => true } = {}) {
  const picker = document.getElementById("transactions-month");
  if (!picker) return;
  picker.value = monthValue(new Date());
  const onChange = () => LoadTransactionsPanel(picker.value, getReport, isCurrent);
  picker.addEventListener("change", onChange);
  onChange();
  return () => {
    requestVersion++;
    picker.removeEventListener("change", onChange);
    chart?.destroy();
    chart = null;
  };
}
