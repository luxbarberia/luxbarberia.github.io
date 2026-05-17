import { icon } from "./icons.js";
import { money } from "./calculations.js";
import { getBudgetSummary } from "./budgetUtils.js";
import { donut } from "./charts.js";

export const BudgetPanel = ({ state }) => {
  const { movements, settings } = state;
  const summary = getBudgetSummary(movements, settings);
  const currency = settings.currency;
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon("target")} Control mensual</span>
        <h1>Presupuesto</h1>
      </div>
      <button class="fab-inline" data-action="save-budget">${icon("check")} Guardar</button>
    </section>

    <section class="card">
      <form class="form-stack compact" data-form="budget">
        <label>Presupuesto mensual general
          <input name="monthlyBudget" inputmode="decimal" type="number" min="0" step="1" value="${settings.monthlyBudget || ""}" placeholder="0" />
        </label>
      </form>
      <div class="budget-hero">
        ${donut(summary.monthly.spent, summary.monthly.budget || summary.monthly.spent || 1, currency)}
        <div>
          <span class="pill ${summary.monthly.status.level}">${summary.monthly.status.label}</span>
          <h2>${money(summary.monthly.available, currency)} disponibles</h2>
          <p>Para llegar bien a fin de mes: ${money(summary.monthly.recommendedDaily, currency)} por dia.</p>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <span class="eyebrow">Por categoria</span>
          <h2>Limites mensuales</h2>
        </div>
      </div>
      <form class="category-budget-list" data-form="category-budgets">
        ${summary.categories
          .map(
            (category) => `
              <label class="category-budget">
                <span>
                  <strong>${category.name}</strong>
                  <small>${money(category.spent, currency)} usados</small>
                </span>
                <input name="${category.name}" inputmode="decimal" type="number" min="0" step="1" value="${category.budget || ""}" placeholder="0" />
                <em class="${category.status.level}">${Math.round((category.status.ratio || 0) * 100)}%</em>
              </label>
            `
          )
          .join("")}
      </form>
    </section>
  `;
};
