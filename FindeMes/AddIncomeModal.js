import { icon } from "./icons.js";
import { todayISO } from "./dateUtils.js";

export const AddIncomeModal = ({ movement }) => {
  const editing = Boolean(movement);
  const recurring = movement?.recurring || {};
  return `
    <div class="modal-shell" role="dialog" aria-modal="true">
      <div class="modal-card">
        <div class="modal-head">
          <div>
            <span class="eyebrow">${icon("plus")} ${editing ? "Editar" : "Nuevo"} ingreso</span>
            <h2>${editing ? "Editar ingreso" : "Agregar ingreso"}</h2>
          </div>
          <button class="icon-btn" data-action="close-modal" aria-label="Cerrar">${icon("x")}</button>
        </div>
        <form class="form-stack" data-form="income" data-id="${movement?.id || ""}">
          <label>Monto
            <input name="amount" inputmode="decimal" type="number" min="0.01" step="0.01" required placeholder="0" value="${movement?.amount || ""}" />
          </label>
          <label>Descripcion
            <input name="description" type="text" required placeholder="Ej: sueldo, venta, transferencia" value="${movement?.description || ""}" />
          </label>
          <label>Fecha
            <input name="date" type="date" required value="${movement?.date || todayISO()}" />
          </label>
          <div class="switch-row">
            <label class="switch"><input name="recurringEnabled" type="checkbox" ${recurring.enabled ? "checked" : ""} /> <span>Ingreso recurrente</span></label>
            <select name="frequency">
              <option value="daily" ${recurring.frequency === "daily" ? "selected" : ""}>Diario</option>
              <option value="weekly" ${recurring.frequency === "weekly" ? "selected" : ""}>Semanal</option>
              <option value="monthly" ${!recurring.frequency || recurring.frequency === "monthly" ? "selected" : ""}>Mensual</option>
            </select>
          </div>
          <button class="primary-btn income" type="submit">${icon("check")} Guardar ingreso</button>
        </form>
      </div>
    </div>
  `;
};
