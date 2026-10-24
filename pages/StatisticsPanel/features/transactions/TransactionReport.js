function toDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function readFirstDefined(sources, keys) {
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    for (const key of keys) {
      if (Object.hasOwn(source, key)) return source[key];
    }
  }
  return undefined;
}

function asAmount(value, fallback = 0) {
  if (value === null) return null;
  if (value === undefined) return fallback;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
}

export function BuildTransactionReport(data) {
  const summary = data?.summary ?? {};
  const transactions = (data?.items ?? []).map((item) => ({
    id: item.id,
    date: toDate(item.dateTime ?? item.date),
    type: String(item.type ?? "income").toLowerCase() === "expense" ? "expense" : "income",
    amount: item.grossAmount === null
      ? null
      : Number(item.grossAmount ?? item.amount ?? 0),
    vatRate: item.vatRate ?? null,
    vatAmount: item.vatAmount ?? null,
    title: item.description ?? item.title ?? (item.type === "expense" ? "Árubevételezés" : `Értékesítés #${item.id}`),
    detail: item.detail ?? [item.quantity, item.unit].filter((value) => value !== undefined && value !== null).join(" "),
  })).filter((item) => item.date && (item.amount === null || Number.isFinite(item.amount)))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const daily = new Map((data?.dailyTotals ?? []).map((item) => [item.date, {
    income: asAmount(readFirstDefined([item], ["grossRevenue", "grossIncome", "income", "incomeAmount"])),
    expenses: asAmount(readFirstDefined([item], ["grossPurchases", "grossExpenses", "expenses", "expenseAmount"])),
  }]));
  const incomeValue = readFirstDefined([summary, data], ["grossRevenue", "grossIncome", "income", "totalIncome"]);
  const expenseValue = readFirstDefined([summary, data], ["grossPurchases", "grossExpenses", "expenses", "totalExpenses"]);
  const expenseItems = transactions.filter((item) => item.type === "expense");
  const knownExpenseItems = expenseItems.filter((item) => item.amount !== null);
  const summarizedExpenses = asAmount(expenseValue, null);
  const expensesIncomplete = summarizedExpenses === null && knownExpenseItems.length !== expenseItems.length;
  const expenses = summarizedExpenses ?? (knownExpenseItems.length > 0
    ? knownExpenseItems.reduce((total, item) => total + item.amount, 0)
    : expenseItems.length === 0 ? 0 : null);

  return {
    transactions,
    income: asAmount(incomeValue),
    expenses,
    expensesIncomplete,
    daily,
    totalCount: data?.totalCount ?? transactions.length,
  };
}