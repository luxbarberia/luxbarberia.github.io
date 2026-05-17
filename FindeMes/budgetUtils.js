import { currentMonthExpenses, expensesByCategory, totalByType } from "./calculations.js";
import { getPrediction } from "./prediction.js";

export const getBudgetStatus = (spent, budget, projected = spent) => {
  if (!budget || budget <= 0) return { ratio: 0, level: "neutral", label: "Sin presupuesto" };
  const ratio = spent / budget;
  const projectedRatio = projected / budget;
  if (ratio >= 0.9 || projectedRatio > 1) return { ratio, level: "danger", label: "Alerta" };
  if (ratio >= 0.7) return { ratio, level: "warning", label: "Atencion" };
  return { ratio, level: "ok", label: "En rango" };
};

export const getBudgetSummary = (movements, settings, reference = new Date()) => {
  const expenses = currentMonthExpenses(movements, reference);
  const spent = totalByType(expenses, "expense");
  const prediction = getPrediction(movements, settings, reference);
  const monthlyBudget = Number(settings.monthlyBudget || 0);
  const monthly = {
    spent,
    budget: monthlyBudget,
    available: Math.max(monthlyBudget - spent, 0),
    recommendedDaily: prediction.recommendedDaily,
    status: getBudgetStatus(spent, monthlyBudget, prediction.projected)
  };

  const categoryTotals = expensesByCategory(movements, reference);
  const categories = settings.categories.map((category) => {
    const spentInCategory = categoryTotals.find((item) => item.name === category)?.value || 0;
    const budget = Number(settings.categoryBudgets?.[category] || 0);
    return {
      name: category,
      spent: spentInCategory,
      budget,
      available: Math.max(budget - spentInCategory, 0),
      status: getBudgetStatus(spentInCategory, budget)
    };
  });

  return { monthly, categories };
};
