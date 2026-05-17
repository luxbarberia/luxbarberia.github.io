import { icon } from "./icons.js";
import { filterMovements, money } from "./calculations.js";
import { formatDate, todayISO } from "./dateUtils.js";

export const MovementsList = ({ state }) => {
  const { movements, settings, filters } = state;
  const filtered = filterMovements(movements, filters);
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon("list")} Historial</span>
        <h1>Movimientos</h1>
      </div>
      <button class="fab-inline" data-action="open-expense">${icon("plus")} Gasto</button>
    </section>

    <section class="card filter-card">
      <div class="segmented">
        ${[
          ["all", "Todo"],
          ["today", "Hoy"],
          ["week", "Semana"],
          ["month", "Mes"],
          ["custom", "Rango"]
        ]
          .map(([value, label]) => `<button data-filter-period="${value}" class="${filters.period === value ? "active" : ""}">${label}</button>`)
          .join("")}
      </div>
      <div class="two-col ${filters.period === "custom" ? "" : "hidden"}">
        <label>Desde <input data-filter="from" type="date" value="${filters.from || todayISO()}" /></label>
        <label>Hasta <input data-filter="to" type="date" value="${filters.to || todayISO()}" /></label>
      </div>
      <div class="two-col">
        <label>Categoria
          <select data-filter="category">
            <option value="">Todas</option>
            ${settings.categories.map((category) => `<option value="${category}" ${filters.category === category ? "selected" : ""}>${category}</option>`).join("")}
          </select>
        </label>
        <label>Medio
          <select data-filter="paymentMethod">
            <option value="">Todos</option>
            ${settings.paymentMethods.map((method) => `<option value="${method}" ${filters.paymentMethod === method ? "selected" : ""}>${method}</option>`).join("")}
          </select>
        </label>
      </div>
    </section>

    <section class="movement-list">
      ${
        filtered.length
          ? filtered.map((item) => movementItem(item, settings.currency)).join("")
          : `<div class="empty">${icon("wallet")}<h3>No hay movimientos</h3><p>Cuando registres gastos o ingresos, van a aparecer aca.</p></div>`
      }
    </section>
  `;
};

const movementItem = (item, currency) => {
  const isExpense = item.type === "expense";
  return `
    <article class="movement ${isExpense ? "expense" : "income"}">
      <div class="movement-main">
        <span class="movement-icon">${icon(isExpense ? "arrowUp" : "arrowDown")}</span>
        <div>
          <strong>${item.description || item.category || "Movimiento"}</strong>
          <span>${formatDate(item.date)}${item.category ? ` · ${item.category}` : ""}${item.paymentMethod ? ` · ${item.paymentMethod}` : ""}</span>
          ${item.recurring?.enabled ? `<small>${icon("repeat")} ${item.recurring.paused ? "Recurrente pausado" : `Recurrente ${frequencyLabel(item.recurring.frequency)}`}</small>` : ""}
          ${item.note ? `<small>${icon("note")} ${item.note}</small>` : ""}
        </div>
      </div>
      <div class="movement-side">
        <strong>${isExpense ? "-" : "+"}${money(item.amount, currency)}</strong>
        <div class="icon-row">
          <button class="icon-btn small" data-action="open-note" data-id="${item.id}" aria-label="Nota">${icon("note")}</button>
          <button class="icon-btn small" data-action="edit-movement" data-id="${item.id}" aria-label="Editar">${icon("edit")}</button>
          <button class="icon-btn small danger" data-action="confirm-delete" data-id="${item.id}" aria-label="Eliminar">${icon("trash")}</button>
        </div>
      </div>
    </article>
  `;
};

const frequencyLabel = (value) => ({ daily: "diario", weekly: "semanal", monthly: "mensual" }[value] || "mensual");
