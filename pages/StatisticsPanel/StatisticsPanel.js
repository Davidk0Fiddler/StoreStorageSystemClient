import RequestWeeklyIncome from "../../scripts/api/RequestWeeklyIncome.js";
import RequestTotalIncome from "../../scripts/api/RequestTotalIncome.js";
import RequestDailyIncome from "../../scripts/api/RequestDailyIncome.js";
import RequestMonthlyIncome from "../../scripts/api/RequestMonthlyIncome.js";
import RequestYearlyIncome from "../../scripts/api/RequestYearlyIncome.js";
import RequestShopLogById from "../../scripts/api/RequestShopLogById.js";
import RequestProductPurchase from "../../scripts/api/RequestProductPurchase.js";
import RequestAllBrands from "../../scripts/api/RequestAllBrands.js";

const statisticsPanel = document.getElementById("statistics-content");

let activeStatisticsChart = null;

/* ============================================================
   ÁLTALÁNOS SEGÉDFÜGGVÉNYEK
   ============================================================ */

function GetTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function FormatNumber(value, fractionDigits = 2) {
  return Number(value ?? 0).toLocaleString("hu-HU", {
    maximumFractionDigits: fractionDigits,
  });
}

function FormatForint(value) {
  return `${Number(value ?? 0).toLocaleString("hu-HU")} Ft`;
}

function DestroyActiveChart() {
  if (activeStatisticsChart) {
    activeStatisticsChart.destroy();
    activeStatisticsChart = null;
  }
}

function SetActiveNav(panelId) {
  document
    .querySelectorAll(".statistics-nav-item[data-panel]")
    .forEach((button) => {
      button.classList.toggle("active", button.dataset.panel === panelId);
    });
}

function ShowLoading() {
  DestroyActiveChart();

  statisticsPanel.innerHTML = `
        <div class="d-flex flex-column align-items-center justify-content-center h-100 py-5 text-body-secondary">
            <div
                class="spinner-border text-primary mb-3"
                role="status"
            ></div>

            <div>Adatok betöltése...</div>
        </div>
    `;
}

function ShowError(message) {
  DestroyActiveChart();

  statisticsPanel.innerHTML = `
        <div class="container-fluid">
            <div class="alert alert-danger rounded-4 shadow-sm">
                <i class="bi bi-exclamation-triangle me-2"></i>
                ${message}
            </div>
        </div>
    `;
}

/* ============================================================
   PANEL HTML BETÖLTÉS
   ============================================================ */

async function LoadPanelHtml(fileName) {
  const response = await fetch(`./${fileName}`);

  if (!response.ok) {
    throw new Error(`A panel nem tölthető be: ${fileName}`);
  }

  return await response.text();
}

/* ============================================================
   PANEL VÁLTÁS
   ============================================================ */

async function OpenPanel(panelId) {
  SetActiveNav(panelId);

  try {
    ShowLoading();

    switch (panelId) {
      case "income-panel":
        await DisplayIncomePanel();
        break;

      case "top-products-panel":
        await DisplayTopProductsPanel();
        break;

      case "brands-panel":
        await DisplayBrandsPanel();
        break;

      case "transactions-panel":
        await DisplayTransactionsPanel();
        break;

      case "vat-panel":
        await DisplayVatPanel();
        break;

      default:
        throw new Error(`Ismeretlen statisztikai panel: ${panelId}`);
    }
  } catch (error) {
    console.error(`Panel betöltési hiba (${panelId}):`, error);

    ShowError("A panel betöltése közben hiba történt.");
  }
}

/* ============================================================
   NAVIGÁCIÓ
   ============================================================ */

document
  .querySelectorAll(".statistics-nav-item[data-panel]")
  .forEach((button) => {
    button.addEventListener("click", async () => {
      const panelId = button.dataset.panel;

      await OpenPanel(panelId);
    });
  });

/* ============================================================
   BEVÉTELEK
   ============================================================ */

async function DisplayIncomePanel() {
  const html = await LoadPanelHtml("income-panel.html");

  statisticsPanel.innerHTML = html;

  await InitializeIncomePanel();
}

/* ============================================================
   TOP TERMÉKEK
   ============================================================ */

async function DisplayTopProductsPanel() {
  const html = await LoadPanelHtml("top-products-panel.html");

  statisticsPanel.innerHTML = html;

  await InitializeTopProductsPanel();
}

/* ============================================================
   MÁRKÁK
   ============================================================ */

async function DisplayBrandsPanel() {
  const html = await LoadPanelHtml("brands.html");

  statisticsPanel.innerHTML = html;

  await InitializeBrandsPanel();
}

/* ============================================================
   TRANZAKCIÓK
   ============================================================ */

async function DisplayTransactionsPanel() {
  const html = await LoadPanelHtml("transactions.html");

  statisticsPanel.innerHTML = html;

  InitializeTransactionsPanel();
}

/* ============================================================
   ÁFA
   ============================================================ */

async function DisplayVatPanel() {
  const html = await LoadPanelHtml("vat.html");

  statisticsPanel.innerHTML = html;

  InitializeVatPanel();
}

/* ============================================================
   TOP TERMÉKEK INITIALIZÁLÁSA
   ============================================================ */

async function InitializeTopProductsPanel() {
  const totalElement = document.getElementById("sold-products-total");

  const productsListElement = document.getElementById("sold-products-list");

  const emptyElement = document.getElementById("sold-product-empty");

  const selectedElement = document.getElementById("sold-product-selected");

  const selectedNameElement = document.getElementById("selected-product-name");

  const selectedSkuElement = document.getElementById("selected-product-sku");

  const selectedSkuDetailElement = document.getElementById(
    "selected-product-sku-detail",
  );

  const selectedBrandElement = document.getElementById(
    "selected-product-brand",
  );

  const selectedTotalElement = document.getElementById(
    "selected-product-total",
  );

  const response = await RequestProductPurchase();

  const products = Array.isArray(response)
    ? [...response].sort(
        (a, b) => Number(b.totalPurchased ?? 0) - Number(a.totalPurchased ?? 0),
      )
    : [];

  const totalPurchased = products.reduce(
    (sum, product) => sum + Number(product.totalPurchased ?? 0),
    0,
  );

  totalElement.textContent = `${FormatNumber(totalPurchased)} db`;

  if (products.length === 0) {
    productsListElement.innerHTML = `
            <div class="text-center text-body-secondary py-4">
                <i class="bi bi-box-seam fs-2 d-block mb-2"></i>
                Nincs eladási adat
            </div>
        `;

    return;
  }

  productsListElement.innerHTML = "";

  products.forEach((product, index) => {
    const button = document.createElement("button");

    button.type = "button";

    button.className = "btn btn-light border rounded-3 text-start p-3";

    button.innerHTML = `
            <div class="d-flex align-items-center gap-3">

                <div
                    class="fw-bold text-body-secondary"
                    style="min-width: 30px;"
                >
                    #${index + 1}
                </div>

                <div class="flex-grow-1 min-w-0">

                    <div class="fw-semibold text-truncate">
                        ${product.productName ?? "-"}
                    </div>

                    <div class="small text-body-secondary">
                        ${product.brand ?? "-"}
                        ·
                        ${product.sku ?? "-"}
                    </div>

                </div>

                <div class="text-end">

                    <div class="fw-bold">
                        ${FormatNumber(product.totalPurchased)}
                    </div>

                    <small class="text-body-secondary">
                        db
                    </small>

                </div>

            </div>
        `;

    button.addEventListener("click", () => {
      emptyElement.classList.add("d-none");

      selectedElement.classList.remove("d-none");

      selectedNameElement.textContent = product.productName ?? "-";

      selectedSkuElement.textContent = product.sku ?? "-";

      selectedSkuDetailElement.textContent = product.sku ?? "-";

      selectedBrandElement.textContent = product.brand ?? "-";

      selectedTotalElement.textContent = `${FormatNumber(product.totalPurchased)} db`;
    });

    productsListElement.appendChild(button);
  });
}

/* ============================================================
   MÁRKÁK INITIALIZÁLÁSA
   ============================================================ */

function InitializeBrandsPanel() {
  const brands = [
    {
      name: "Coca-Cola",
      totalSales: 254,
      products: [
        {
          name: "Coca-Cola Zero 0,5L",
          sales: 125,
        },
        {
          name: "Coca-Cola Classic 0,5L",
          sales: 87,
        },
        {
          name: "Coca-Cola Cherry 0,5L",
          sales: 42,
        },
      ],
    },

    {
      name: "Pepsi",
      totalSales: 198,
      products: [
        {
          name: "Pepsi 0,5L",
          sales: 96,
        },
        {
          name: "Pepsi Max 0,5L",
          sales: 72,
        },
        {
          name: "Pepsi Mango 0,5L",
          sales: 30,
        },
      ],
    },

    {
      name: "Lay's",
      totalSales: 176,
      products: [
        {
          name: "Lay's Sós 140g",
          sales: 81,
        },
        {
          name: "Lay's Paprikás 140g",
          sales: 63,
        },
        {
          name: "Lay's Sajtos 140g",
          sales: 32,
        },
      ],
    },

    {
      name: "Milka",
      totalSales: 143,
      products: [
        {
          name: "Milka Alpesi Tej 100g",
          sales: 67,
        },
        {
          name: "Milka Oreo 100g",
          sales: 48,
        },
        {
          name: "Milka Daim 100g",
          sales: 28,
        },
      ],
    },

    {
      name: "Red Bull",
      totalSales: 121,
      products: [
        {
          name: "Red Bull Energy Drink 250ml",
          sales: 74,
        },
        {
          name: "Red Bull Sugarfree 250ml",
          sales: 47,
        },
      ],
    },

    {
      name: "Kinder",
      totalSales: 104,
      products: [
        {
          name: "Kinder Bueno",
          sales: 56,
        },
        {
          name: "Kinder Maxi King",
          sales: 28,
        },
        {
          name: "Kinder Pingui",
          sales: 20,
        },
      ],
    },

    {
      name: "Hell",
      totalSales: 87,
      products: [
        {
          name: "Hell Classic 250ml",
          sales: 51,
        },
        {
          name: "Hell Zero 250ml",
          sales: 36,
        },
      ],
    },
  ];

  const totalSales = brands.reduce((sum, brand) => sum + brand.totalSales, 0);

  const totalCountElement = document.getElementById("brands-total-count");

  const totalSalesElement = document.getElementById("brands-total-sales");

  const topBrandElement = document.getElementById("brands-top-brand");

  const topBrandSalesElement = document.getElementById(
    "brands-top-brand-sales",
  );

  const brandsListElement = document.getElementById("brands-list");

  const searchElement = document.getElementById("brands-search");

  const emptyElement = document.getElementById("brand-selected-empty");

  const selectedElement = document.getElementById("brand-selected");

  const selectedNameElement = document.getElementById("selected-brand-name");

  const selectedSalesElement = document.getElementById("selected-brand-sales");

  const selectedProductsElement = document.getElementById(
    "selected-brand-products",
  );

  const selectedShareElement = document.getElementById("selected-brand-share");

  const selectedTopProductElement = document.getElementById(
    "selected-brand-top-product",
  );

  const selectedTopProductSalesElement = document.getElementById(
    "selected-brand-top-product-sales",
  );

  /* ============================================================
     ÖSSZESÍTÉS
     ============================================================ */

  totalCountElement.textContent = brands.length;

  totalSalesElement.textContent = `${totalSales.toLocaleString("hu-HU")} db`;

  const topBrand = [...brands].sort((a, b) => b.totalSales - a.totalSales)[0];

  if (topBrand) {
    topBrandElement.textContent = topBrand.name;

    topBrandSalesElement.textContent = `${topBrand.totalSales.toLocaleString("hu-HU")} db`;
  }

  /* ============================================================
     MÁRKA KIVÁLASZTÁSA
     ============================================================ */

  function SelectBrand(brand) {
    emptyElement.classList.add("d-none");
    selectedElement.classList.remove("d-none");

    selectedNameElement.textContent = brand.name;

    selectedSalesElement.textContent = `${brand.totalSales.toLocaleString("hu-HU")} db`;

    selectedProductsElement.textContent = brand.products.length;

    const share = totalSales > 0 ? (brand.totalSales / totalSales) * 100 : 0;

    selectedShareElement.textContent = `${share.toFixed(1)}%`;

    const topProduct = [...brand.products].sort((a, b) => b.sales - a.sales)[0];

    if (topProduct) {
      selectedTopProductElement.textContent = topProduct.name;

      selectedTopProductSalesElement.textContent = `${topProduct.sales.toLocaleString("hu-HU")} db`;
    }
  }

  /* ============================================================
     LISTA
     ============================================================ */

  function RenderBrands(searchTerm = "") {
    brandsListElement.innerHTML = "";

    const filteredBrands = brands
      .filter((brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => b.totalSales - a.totalSales);

    if (filteredBrands.length === 0) {
      brandsListElement.innerHTML = `
        <div class="text-center text-body-secondary py-4">
          <i class="bi bi-search fs-2 d-block mb-2"></i>
          Nincs találat
        </div>
      `;

      return;
    }

    filteredBrands.forEach((brand, index) => {
      const button = document.createElement("button");

      button.type = "button";

      button.className = "btn btn-light border rounded-3 text-start p-3";

      const share = totalSales > 0 ? (brand.totalSales / totalSales) * 100 : 0;

      button.innerHTML = `
        <div class="d-flex align-items-center gap-3">

          <div
            class="fw-bold text-body-secondary"
            style="min-width: 30px;"
          >
            #${index + 1}
          </div>

          <div
            class="bg-primary-subtle text-primary rounded-3 p-2"
          >
            <i class="bi bi-tag-fill"></i>
          </div>

          <div class="flex-grow-1 min-w-0">

            <div class="fw-semibold text-truncate">
              ${brand.name}
            </div>

            <div class="small text-body-secondary">
              ${brand.products.length} termék
              ·
              ${share.toFixed(1)}%
            </div>

          </div>

          <div class="text-end">

            <div class="fw-bold">
              ${brand.totalSales.toLocaleString("hu-HU")}
            </div>

            <small class="text-body-secondary">
              db
            </small>

          </div>

        </div>
      `;

      button.addEventListener("click", () => SelectBrand(brand));

      brandsListElement.appendChild(button);
    });
  }

  /* ============================================================
     KERESÉS
     ============================================================ */

  searchElement.addEventListener("input", () => {
    RenderBrands(searchElement.value);
  });

  /* ============================================================
     INDÍTÁS
     ============================================================ */

  RenderBrands();
}

/* ============================================================
   BEVÉTELI PANEL
   ============================================================ */

async function InitializeIncomePanel() {
  const incomeChartElement = document.getElementById("income-chart");

  const dailyChartBtn = document.getElementById("daily-chart-btn");

  const weeklyChartBtn = document.getElementById("weekly-chart-btn");

  const monthlyChartBtn = document.getElementById("monthly-chart-btn");

  const yearlyChartBtn = document.getElementById("yearly-chart-btn");

  const chartButtons = [
    dailyChartBtn,
    weeklyChartBtn,
    monthlyChartBtn,
    yearlyChartBtn,
  ];

  let currentChartPeriod = "daily";

  let chartDates = [];

  let chartLogIds = [];

  activeStatisticsChart = new Chart(incomeChartElement, {
    type: "bar",

    data: {
      labels: [],

      datasets: [
        {
          label: "Bevétel",
          data: [],
          backgroundColor: "#5555FF",
          borderRadius: 0,
          borderSkipped: false,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      interaction: {
        intersect: false,
        mode: "index",
      },

      plugins: {
        legend: {
          display: false,
        },

        tooltip: {
          displayColors: false,

          callbacks: {
            label: function (context) {
              return `${context.parsed.y.toLocaleString("hu-HU")} Ft`;
            },
          },
        },
      },

      scales: {
        x: {
          grid: {
            display: false,
          },
        },

        y: {
          beginAtZero: true,

          ticks: {
            callback: function (value) {
              return `${value.toLocaleString("hu-HU")} Ft`;
            },
          },
        },
      },

      onClick: async function (event, elements) {
        if (!elements.length) {
          return;
        }

        const index = elements[0].index;

        const selectedDate = chartDates[index];

        switch (currentChartPeriod) {
          case "yearly":
            SetActiveChartButton(monthlyChartBtn);

            await LoadMonthlyIncomeChart(selectedDate);

            break;

          case "monthly":
            SetActiveChartButton(dailyChartBtn);

            await LoadDailyIncomeChart(selectedDate);

            break;

          case "weekly":
            SetActiveChartButton(dailyChartBtn);

            await LoadDailyIncomeChart(selectedDate);

            break;

          case "daily":
            await OpenShopLogDetails(chartLogIds[index]);

            break;
        }
      },
    },
  });

  function SetActiveChartButton(activeButton) {
    chartButtons.forEach((button) => {
      button.classList.toggle("btn-primary", button === activeButton);

      button.classList.toggle("btn-outline-primary", button !== activeButton);

      button.classList.toggle("active", button === activeButton);
    });
  }

  async function LoadTotalIncome() {
    const totalIncome = await RequestTotalIncome();

    document.getElementById("total-income-area").textContent = FormatForint(
      totalIncome.totalIncome,
    );
  }

  async function LoadTodayIncome() {
    const todayIncome = await RequestDailyIncome(GetTodayDate());

    document.getElementById("today-income-area").textContent = FormatForint(
      todayIncome.income,
    );

    document.getElementById("today-shoplog-count-area").textContent =
      `${todayIncome.shopLogs?.length ?? 0} értékesítés`;
  }

  function FormatDateLabel(date) {
    const [year, month, day] = date.split("-");

    return `${month}.${day}.`;
  }

  function GetWeekDates(referenceDateString) {
    const referenceDate = new Date(`${referenceDateString}T00:00:00`);

    const dayOfWeek = referenceDate.getDay();

    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    referenceDate.setDate(referenceDate.getDate() - daysFromMonday);

    const dates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(referenceDate);

      date.setDate(referenceDate.getDate() + i);

      const year = date.getFullYear();

      const month = String(date.getMonth() + 1).padStart(2, "0");

      const day = String(date.getDate()).padStart(2, "0");

      dates.push(`${year}-${month}-${day}`);
    }

    return dates;
  }

  async function LoadDailyIncomeChart(date) {
    const dailyIncome = await RequestDailyIncome(date);

    const shopLogs = [...(dailyIncome.shopLogs ?? [])].sort(
      (a, b) => new Date(a.dateTime) - new Date(b.dateTime),
    );

    const labels = shopLogs.map((log) => {
      return new Date(log.dateTime).toLocaleTimeString("hu-HU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    });

    const values = shopLogs.map((log) => log.totalPrice);

    chartDates = shopLogs.map(() => date);

    chartLogIds = shopLogs.map((log) => log.id);

    currentChartPeriod = "daily";

    activeStatisticsChart.data.labels = labels;

    activeStatisticsChart.data.datasets[0].data = values;

    activeStatisticsChart.update();
  }

  async function LoadWeeklyIncomeChart() {
    const weeklyIncome = await RequestWeeklyIncome(GetTodayDate());

    const dailyShopLogs = weeklyIncome.dailyShopLogs ?? [];

    const incomeByDate = new Map(
      dailyShopLogs.map((item) => [item.date, item.income]),
    );

    const weekDates = GetWeekDates(weeklyIncome.date);

    chartDates = weekDates;

    chartLogIds = [];

    currentChartPeriod = "weekly";

    activeStatisticsChart.data.labels = weekDates.map(FormatDateLabel);

    activeStatisticsChart.data.datasets[0].data = weekDates.map(
      (date) => incomeByDate.get(date) ?? 0,
    );

    activeStatisticsChart.update();
  }

  async function LoadMonthlyIncomeChart(date) {
    const monthlyIncome = await RequestMonthlyIncome(date);

    const dailyShopLogs =
      monthlyIncome.dailyShopLogs ??
      monthlyIncome.dailyIncome ??
      monthlyIncome.logs ??
      [];

    const incomeByDate = new Map(
      dailyShopLogs.map((item) => [
        item.date,
        item.income ?? item.totalIncome ?? 0,
      ]),
    );

    const referenceDate = new Date(`${monthlyIncome.date ?? date}T00:00:00`);

    const year = referenceDate.getFullYear();

    const month = referenceDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    chartDates = [];
    chartLogIds = [];

    const labels = [];
    const values = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(
        2,
        "0",
      )}-${String(day).padStart(2, "0")}`;

      chartDates.push(dateString);

      labels.push(FormatDateLabel(dateString));

      values.push(incomeByDate.get(dateString) ?? 0);
    }

    currentChartPeriod = "monthly";

    activeStatisticsChart.data.labels = labels;

    activeStatisticsChart.data.datasets[0].data = values;

    activeStatisticsChart.update();
  }

  async function LoadYearlyIncomeChart() {
    const yearlyIncome = await RequestYearlyIncome(GetTodayDate());

    const monthlyShopLogs =
      yearlyIncome.monthlyShopLogs ??
      yearlyIncome.monthlyIncome ??
      yearlyIncome.logs ??
      [];

    const incomeByMonth = new Map(
      monthlyShopLogs.map((item) => [
        item.date,
        item.income ?? item.totalIncome ?? 0,
      ]),
    );

    const referenceDate = new Date(
      `${yearlyIncome.date ?? GetTodayDate()}T00:00:00`,
    );

    const year = referenceDate.getFullYear();

    const labels = [
      "Jan.",
      "Feb.",
      "Már.",
      "Ápr.",
      "Máj.",
      "Jún.",
      "Júl.",
      "Aug.",
      "Szep.",
      "Okt.",
      "Nov.",
      "Dec.",
    ];

    chartDates = [];
    chartLogIds = [];

    const values = [];

    for (let month = 1; month <= 12; month++) {
      const monthString = `${year}-${String(month).padStart(2, "0")}`;

      chartDates.push(`${monthString}-01`);

      let income = incomeByMonth.get(monthString);

      if (income === undefined) {
        const matchingItem = monthlyShopLogs.find(
          (item) => item.date?.substring(0, 7) === monthString,
        );

        income = matchingItem?.income ?? matchingItem?.totalIncome ?? 0;
      }

      values.push(income);
    }

    currentChartPeriod = "yearly";

    activeStatisticsChart.data.labels = labels;

    activeStatisticsChart.data.datasets[0].data = values;

    activeStatisticsChart.update();
  }

  async function SelectChart(type) {
    switch (type) {
      case "daily":
        SetActiveChartButton(dailyChartBtn);

        await LoadDailyIncomeChart(GetTodayDate());

        break;

      case "weekly":
        SetActiveChartButton(weeklyChartBtn);

        await LoadWeeklyIncomeChart();

        break;

      case "monthly":
        SetActiveChartButton(monthlyChartBtn);

        await LoadMonthlyIncomeChart(GetTodayDate());

        break;

      case "yearly":
        SetActiveChartButton(yearlyChartBtn);

        await LoadYearlyIncomeChart();

        break;
    }
  }

  dailyChartBtn.addEventListener("click", () => SelectChart("daily"));

  weeklyChartBtn.addEventListener("click", () => SelectChart("weekly"));

  monthlyChartBtn.addEventListener("click", () => SelectChart("monthly"));

  yearlyChartBtn.addEventListener("click", () => SelectChart("yearly"));

  await LoadTodayIncome();

  await LoadTotalIncome();

  await SelectChart("daily");
}

/* ============================================================
   SHOPLOG RÉSZLETEK
   ============================================================ */

async function OpenShopLogDetails(id) {
  if (!id) {
    return;
  }

  try {
    const shopLog = await RequestShopLogById(id);

    document.getElementById("shoplog-date").textContent = new Date(
      shopLog.dateTime,
    ).toLocaleString("hu-HU");

    document.getElementById("shoplog-products-count").textContent =
      shopLog.productsCount;

    document.getElementById("shoplog-products-count-stat").textContent =
      `${shopLog.productsCount} tétel`;

    document.getElementById("shoplog-products-price").textContent =
      FormatForint(shopLog.productsPriceSUM);

    document.getElementById("shoplog-deposit").textContent = FormatForint(
      shopLog.depositSUM,
    );

    document.getElementById("shoplog-deposit-bottom").textContent =
      FormatForint(shopLog.depositSUM);

    document.getElementById("shoplog-total-price").textContent = FormatForint(
      shopLog.totalPrice,
    );

    document.getElementById("shoplog-total-price-bottom").textContent =
      FormatForint(shopLog.totalPrice);

    LoadShopLogProducts(shopLog.productsJson);

    const modalElement = document.getElementById("shoplog-details-modal");

    bootstrap.Modal.getOrCreateInstance(modalElement).show();
  } catch (error) {
    console.error("ShopLog részletek betöltési hiba:", error);
  }
}

function LoadShopLogProducts(productsJson) {
  const area = document.getElementById("shoplog-products-area");

  area.innerHTML = "";

  let products;

  try {
    products = JSON.parse(productsJson);
  } catch {
    area.innerHTML = `
            <div class="alert alert-danger rounded-3">
                <i class="bi bi-exclamation-triangle me-2"></i>
                A vásárolt termékek adatai nem olvashatók.
            </div>
        `;

    return;
  }

  products.forEach((product) => {
    const row = document.createElement("div");

    row.className = "bg-body rounded-4 p-3 mb-2";

    const productTotal =
      Number(product.Quantity ?? 0) * Number(product.UnitPrice ?? 0);

    row.innerHTML = `
            <div class="row align-items-center g-3">

                <div class="col-lg-5">

                    <div class="d-flex align-items-center gap-3">

                        <div class="bg-primary bg-opacity-10 text-primary rounded-3 p-2">
                            <i class="bi bi-box-seam fs-4"></i>
                        </div>

                        <div>

                            <div class="fw-bold fs-5">
                                ${product.ProductName ?? "-"}
                            </div>

                            <div class="small text-body-secondary">
                                ${product.Brand ?? ""}
                            </div>

                        </div>

                    </div>

                </div>

                <div class="col-lg-3">

                    <div class="small">

                        <span class="text-body-secondary">
                            SKU:
                        </span>

                        <span class="fw-semibold">
                            ${product.SKU ?? "-"}
                        </span>

                    </div>

                    ${
                      product.Barcode
                        ? `
                                <div class="small mt-1">

                                    <span class="text-body-secondary">
                                        Vonalkód:
                                    </span>

                                    <span class="fw-semibold">
                                        ${product.Barcode}
                                    </span>

                                </div>
                            `
                        : ""
                    }

                </div>

                <div class="col-lg-2">

                    <div class="small text-body-secondary">
                        Mennyiség
                    </div>

                    <div class="fw-bold fs-5">
                        ${product.Quantity ?? 0}
                    </div>

                    <div class="small text-body-secondary">
                        ${FormatForint(product.UnitPrice)} / egység
                    </div>

                </div>

                <div class="col-lg-2 text-lg-end">

                    <div class="fw-bold fs-4">
                        ${FormatForint(productTotal)}
                    </div>

                    ${
                      Number(product.DepositAmount ?? 0) > 0
                        ? `
                                <span class="badge text-bg-warning rounded-pill">
                                    <i class="bi bi-recycle me-1"></i>
                                    +${FormatForint(product.DepositAmount)}
                                </span>
                            `
                        : ""
                    }

                </div>

            </div>
        `;

    area.appendChild(row);
  });
}

/* ============================================================
   INDÍTÁS
   ============================================================ */

await OpenPanel("income-panel");

//#region Tranzakció Panel

function InitializeTransactionsPanel() {
  const canvas = document.getElementById("transactions-chart");

  if (!canvas) {
    return;
  }

  new Chart(canvas, {
    type: "bar",

    data: {
      labels: [
        "Hétfő",
        "Kedd",
        "Szerda",
        "Csütörtök",
        "Péntek",
        "Szombat",
        "Vasárnap",
      ],

      datasets: [
        {
          label: "Tranzakciók",
          data: [82, 96, 74, 113, 128, 151, 128],
          borderRadius: 8,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        x: {
          grid: {
            display: false,
          },
        },

        y: {
          beginAtZero: true,

          ticks: {
            precision: 0,
          },
        },
      },
    },
  });
}
//#endregion

//#region Áfa Panel:

function InitializeVatPanel() {
  const distributionCanvas = document.getElementById("vat-distribution-chart");

  const vatCanvas = document.getElementById("vat-chart");

  if (distributionCanvas) {
    new Chart(distributionCanvas, {
      type: "doughnut",

      data: {
        labels: ["27% ÁFA", "18% ÁFA", "5% ÁFA"],

        datasets: [
          {
            data: [72, 18, 10],
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
          legend: {
            position: "bottom",
          },
        },

        cutout: "65%",
      },
    });
  }

  if (vatCanvas) {
    new Chart(vatCanvas, {
      type: "line",

      data: {
        labels: ["Ápr.", "Máj.", "Jún.", "Júl.", "Aug.", "Szep."],

        datasets: [
          {
            label: "ÁFA",

            data: [108400, 116200, 121500, 119800, 128420, 145524],

            tension: 0.35,

            fill: true,
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false,
          },
        },

        scales: {
          x: {
            grid: {
              display: false,
            },
          },

          y: {
            beginAtZero: true,

            ticks: {
              callback: function (value) {
                return `${value.toLocaleString("hu-HU")} Ft`;
              },
            },
          },
        },
      },
    });
  }
}

//#endregion
