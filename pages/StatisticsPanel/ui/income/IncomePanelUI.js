import {
  FormatForint,
  GetTodayDate,
} from "../../features/shared/formatters.js";

let activeIncomeChart = null;

const noIncomeDataPlugin = {
  id: "noIncomeDataMessage",
  afterDraw(chart) {
    const hasIncome = chart.data.datasets.some((dataset) =>
      (dataset.data ?? []).some(
        (value) => Number(value) !== 0 && Number.isFinite(Number(value)),
      ),
    );

    if (hasIncome || !chart.chartArea) return;

    const { left, right, top, bottom } = chart.chartArea;
    const context = chart.ctx;
    context.save();
    context.fillStyle = "#6c757d";
    context.font = "14px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      "Ezen az idősávon nem történt vásárlás.",
      (left + right) / 2,
      (top + bottom) / 2,
    );
    context.restore();
  },
};

export function DestroyActiveIncomeChart() {
  activeIncomeChart?.destroy();
  activeIncomeChart = null;
}
export async function InitializeIncomePanelUI({
  getTotalIncome,
  getDailyIncome,
  getWeeklyIncome,
  getMonthlyIncome,
  getYearlyIncome,
  openShopLogDetails,
  isCurrent = () => true,
} = {}) {
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

  activeIncomeChart = new Chart(incomeChartElement, {
    type: "bar",
    plugins: [noIncomeDataPlugin],

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
            if (isCurrent()) await openShopLogDetails(chartLogIds[index]);

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
    const totalIncome = await getTotalIncome();
    if (!isCurrent()) return;

    document.getElementById("total-income-area").textContent = FormatForint(
      totalIncome.totalIncome,
    );
  }

  async function LoadTodayIncome() {
    const todayIncome = await getDailyIncome(GetTodayDate());
    if (!isCurrent()) return;

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
    const dailyIncome = await getDailyIncome(date);
    if (!isCurrent() || !activeIncomeChart) return;

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

    activeIncomeChart.data.labels = labels;

    activeIncomeChart.data.datasets[0].data = values;

    activeIncomeChart.update();
  }

  async function LoadWeeklyIncomeChart() {
    const weeklyIncome = await getWeeklyIncome(GetTodayDate());
    if (!isCurrent() || !activeIncomeChart) return;

    const dailyShopLogs = weeklyIncome.dailyShopLogs ?? [];

    const incomeByDate = new Map(
      dailyShopLogs.map((item) => [item.date, item.income]),
    );

    const weekDates = GetWeekDates(weeklyIncome.date);

    chartDates = weekDates;

    chartLogIds = [];

    currentChartPeriod = "weekly";

    activeIncomeChart.data.labels = weekDates.map(FormatDateLabel);

    activeIncomeChart.data.datasets[0].data = weekDates.map(
      (date) => incomeByDate.get(date) ?? 0,
    );

    activeIncomeChart.update();
  }

  async function LoadMonthlyIncomeChart(date) {
    const monthlyIncome = await getMonthlyIncome(date);
    if (!isCurrent() || !activeIncomeChart) return;

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

    activeIncomeChart.data.labels = labels;

    activeIncomeChart.data.datasets[0].data = values;

    activeIncomeChart.update();
  }

  async function LoadYearlyIncomeChart() {
    const yearlyIncome = await getYearlyIncome(GetTodayDate());
    if (!isCurrent() || !activeIncomeChart) return;

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

    activeIncomeChart.data.labels = labels;

    activeIncomeChart.data.datasets[0].data = values;

    activeIncomeChart.update();
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
