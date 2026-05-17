import { daysInCurrentMonth, daysRemainingInMonth, parseLocalDate } from "./dateUtils.js";
import { currentMonthExpenses, totalByType } from "./calculations.js";

export const countRemainingOccurrences = (movement, reference = new Date()) => {
  if (!movement.recurring?.enabled || movement.recurring?.paused || movement.type !== "expense") return 0;

  const anchor = parseLocalDate(movement.date);
  const monthEnd = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  let count = 0;

  if (movement.recurring.frequency === "daily") {
    return Math.max(monthEnd.getDate() - reference.getDate(), 0);
  }

  if (movement.recurring.frequency === "weekly") {
    for (let day = reference.getDate() + 1; day <= monthEnd.getDate(); day += 1) {
      const candidate = new Date(reference.getFullYear(), reference.getMonth(), day);
      if (candidate.getDay() === anchor.getDay()) count += 1;
    }
    return count;
  }

  if (movement.recurring.frequency === "monthly") {
    const targetDay = Math.min(anchor.getDate(), monthEnd.getDate());
    return targetDay > reference.getDate() ? 1 : 0;
  }

  return 0;
};

export const getPendingRecurringExpenses = (movements, reference = new Date()) =>
  movements
    .filter((item) => item.type === "expense" && item.recurring?.enabled && !item.recurring?.paused)
    .map((item) => ({
      ...item,
      occurrences: countRemainingOccurrences(item, reference),
      pendingAmount: countRemainingOccurrences(item, reference) * item.amount
    }))
    .filter((item) => item.occurrences > 0);

export const getPrediction = (movements, settings, reference = new Date()) => {
  const expenses = currentMonthExpenses(movements, reference);
  const accumulated = totalByType(expenses, "expense");
  const elapsedDays = Math.max(reference.getDate(), 1);
  const remainingDays = daysRemainingInMonth(reference);
  const averageDaily = accumulated / elapsedDays;
  const pendingRecurring = getPendingRecurringExpenses(movements, reference);
  const recurringPendingTotal = pendingRecurring.reduce((sum, item) => sum + item.pendingAmount, 0);
  const projected = accumulated + averageDaily * remainingDays + recurringPendingTotal;
  const budget = Number(settings.monthlyBudget || 0);
  const difference = budget ? budget - projected : 0;
  const availableNow = budget ? Math.max(budget - accumulated - recurringPendingTotal, 0) : 0;
  const recommendedDaily = remainingDays ? availableNow / remainingDays : availableNow;
  const usedRatio = budget ? projected / budget : 0;
  const risk = !budget || usedRatio < 0.7 ? "bajo" : usedRatio < 0.95 ? "medio" : "alto";

  return {
    accumulated,
    averageDaily,
    remainingDays,
    daysInMonth: daysInCurrentMonth(reference),
    pendingRecurring,
    recurringPendingTotal,
    projected,
    budget,
    difference,
    recommendedDaily,
    risk
  };
};
