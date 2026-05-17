import {
  getCurrentMonthRange,
  getMonthDaysUntilToday,
  isInRange,
  isSameDay,
  isThisMonth,
  isThisWeek
} from "./dateUtils.js";

export const money = (value, currency = "ARS") =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);

export const sortByDateDesc = (movements) =>
  [...movements].sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));

export const totalByType = (movements, type) =>
  movements.filter((item) => item.type === type).reduce((sum, item) => sum + Number(item.amount || 0), 0);

export const getBalance = (movements) => totalByType(movements, "income") - totalByType(movements, "expense");

export const getDashboardMetrics = (movements, settings, reference = new Date()) => {
  const monthExpenses = movements.filter((item) => item.type === "expense" && isThisMonth(item.date, reference));
  const monthIncome = movements.filter((item) => item.type === "income" && isThisMonth(item.date, reference));
  const spentMonth = totalByType(monthExpenses, "expense");
  const monthlyIncome = totalByType(monthIncome, "income");

  return {
    balance: getBalance(movements),
    spentToday: totalByType(
      movements.filter((item) => item.type === "expense" && isSameDay(item.date, reference)),
      "expense"
    ),
    spentWeek: totalByType(
      movements.filter((item) => item.type === "expense" && isThisWeek(item.date, reference)),
      "expense"
    ),
    spentMonth,
    monthlyIncome,
    monthDifference: monthlyIncome - spentMonth,
    budget: Number(settings.monthlyBudget || 0)
  };
};

export const filterMovements = (movements, filters) => {
  return sortByDateDesc(movements).filter((item) => {
    if (filters.period === "today" && !isSameDay(item.date)) return false;
    if (filters.period === "week" && !isThisWeek(item.date)) return false;
    if (filters.period === "month" && !isThisMonth(item.date)) return false;
    if (filters.period === "custom" && filters.from && filters.to && !isInRange(item.date, filters.from, filters.to)) {
      return false;
    }
    if (filters.category && item.category !== filters.category) return false;
    if (filters.paymentMethod && item.paymentMethod !== filters.paymentMethod) return false;
    return true;
  });
};

export const expensesByCategory = (movements, reference = new Date()) => {
  const totals = {};
  movements
    .filter((item) => item.type === "expense" && isThisMonth(item.date, reference))
    .forEach((item) => {
      totals[item.category || "Otros"] = (totals[item.category || "Otros"] || 0) + item.amount;
    });
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

export const dailyExpenseEvolution = (movements, reference = new Date()) => {
  const days = getMonthDaysUntilToday(reference);
  let running = 0;
  return days.map((date) => {
    running += totalByType(
      movements.filter((item) => item.type === "expense" && item.date === date),
      "expense"
    );
    return { date, value: running };
  });
};

export const incomeVsExpense = (movements, reference = new Date()) => {
  const monthMovements = movements.filter((item) => isThisMonth(item.date, reference));
  return [
    { name: "Ingresos", value: totalByType(monthMovements, "income") },
    { name: "Gastos", value: totalByType(monthMovements, "expense") }
  ];
};

export const currentMonthExpenses = (movements, reference = new Date()) =>
  movements.filter((item) => item.type === "expense" && isThisMonth(item.date, reference));

export const currentMonthRange = getCurrentMonthRange;
