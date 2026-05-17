import { icon } from "./icons.js";
import { money } from "./calculations.js";
import { formatDate } from "./dateUtils.js";

export const RecurringExpensesPanel = ({ state }) => {
  const recurring = state.movements.filter((item) => item.recurring?.enabled);
  return `
    <section class="card">
      <div class="section-head">
        <div>
          <span class="eyebrow">${icon("repeat")} Automatizados</span>
          <h2>Gastos e ingresos recurrentes</h2>
        </div>
      </div>
      ${
        recurring.length
          ? recurring
              .map(
                (item) => `
                  <article class="recurring-card ${item.recurring.paused ? "paused" : ""}">
                    <div>
                      <strong>${item.description || item.category || "Movimiento recurrente"}</strong>
                      <span>${formatDate(item.date)} · ${frequencyLabel(item.recurring.frequency)}</span>
                    </div>
                    <strong>${item.type === "expense" ? "-" : "+"}${money(item.amount, state.settings.currency)}</strong>
                    <button class="ghost-btn small" data-action="toggle-recurring" data-id="${item.id}">
                      ${item.recurring.paused ? "Reactivar" : "Pausar"}
                    </button>
                  </article>
                `
              )
              .join("")
          : `<div class="empty mini">Marca un movimiento como recurrente para verlo aca.</div>`
      }
    </section>
  `;
};

const frequencyLabel = (value) => ({ daily: "Diario", weekly: "Semanal", monthly: "Mensual" }[value] || "Mensual");
