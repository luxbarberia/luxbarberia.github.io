import { icon } from "./icons.js";
import { money, expensesByCategory, dailyExpenseEvolution, incomeVsExpense } from "./calculations.js";
import { getPrediction } from "./prediction.js";
import { getBudgetStatus } from "./budgetUtils.js";
import { barList, lineChart, donut } from "./charts.js";

export const Dashboard = ({ state }) => {
  const { movements, settings, metrics } = state;
  const currency = settings.currency;
  const prediction = getPrediction(movements, settings);
  const budgetStatus = getBudgetStatus(metrics.spentMonth, metrics.budget, prediction.projected);
  const diffTone = metrics.monthDifference >= 0 ? "positive" : "negative";
  const hasBudgetRisk = metrics.budget > 0 && prediction.projected > metrics.budget;

  return `
    <section class="hero-card">
      <div class="hero-top">
        <div>
          <span class="eyebrow">${icon("wallet")} Saldo disponible</span>
          <h1>${money(metrics.balance, currency)}</h1>
        </div>
        <button class="icon-btn" data-action="toggle-theme" aria-label="Cambiar tema">
          ${icon(settings.theme === "dark" ? "sun" : "moon")}
        </button>
      </div>
      <div class="hero-grid">
        <div><span>Hoy</span><strong>${money(metrics.spentToday, currency)}</strong></div>
        <div><span>Semana</span><strong>${money(metrics.spentWeek, currency)}</strong></div>
        <div><span>Mes</span><strong>${money(metrics.spentMonth, currency)}</strong></div>
      </div>
      ${
        hasBudgetRisk
          ? `<div class="alert danger">${icon("alert")} Vas camino a superar el presupuesto mensual por ${money(Math.abs(prediction.difference), currency)}.</div>`
          : `<div class="alert ${budgetStatus.level}">${icon("target")} Ritmo mensual: ${budgetStatus.label}. Proyectado ${money(prediction.projected, currency)}.</div>`
      }
    </section>

    <section class="quick-grid">
      <button class="quick-action primary" data-action="open-expense">${icon("minus")}<span>Agregar gasto</span></button>
      <button class="quick-action income" data-action="open-income">${icon("plus")}<span>Agregar ingreso</span></button>
      <button class="quick-action" data-nav="movements">${icon("list")}<span>Movimientos</span></button>
      <button class="quick-action" data-nav="budget">${icon("target")}<span>Presupuesto</span></button>
      <button class="quick-action" data-nav="prediction">${icon("chart")}<span>Prediccion</span></button>
      <button class="quick-action" data-action="open-calculator">${icon("calculator")}<span>Calculadora</span></button>
    </section>

    <section class="metric-grid">
      <article class="metric-card">
        <span>Ingresos del mes</span>
        <strong>${money(metrics.monthlyIncome, currency)}</strong>
      </article>
      <article class="metric-card ${diffTone}">
        <span>Diferencia mensual</span>
        <strong>${money(metrics.monthDifference, currency)}</strong>
      </article>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <span class="eyebrow">${icon("chart")} Gasto mensual</span>
          <h2>Presupuesto usado</h2>
        </div>
        <span class="pill ${budgetStatus.level}">${budgetStatus.label}</span>
      </div>
      ${donut(metrics.spentMonth, metrics.budget || metrics.spentMonth || 1, currency)}
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <span class="eyebrow">Categorias</span>
          <h2>Gastos por categoria</h2>
        </div>
      </div>
      ${barList(expensesByCategory(movements), currency)}
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <span class="eyebrow">Mes actual</span>
          <h2>Evolucion diaria</h2>
        </div>
      </div>
      ${lineChart(dailyExpenseEvolution(movements), currency)}
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <span class="eyebrow">Flujo</span>
          <h2>Ingresos vs gastos</h2>
        </div>
      </div>
      ${barList(incomeVsExpense(movements), currency)}
    </section>
  `;
};
