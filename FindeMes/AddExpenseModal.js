import { icon } from "./icons.js";
import { todayISO } from "./dateUtils.js";

export const AddExpenseModal = ({ settings, movement }) => {
  const editing = Boolean(movement);
  const recurring = movement?.recurring || {};
  return `
    <div class="modal-shell" role="dialog" aria-modal="true">
      <div class="modal-card">
        <div class="modal-head">
          <div>
            <span class="eyebrow">${icon("minus")} ${editing ? "Editar" : "Nuevo"} gasto</span>
            <h2>${editing ? "Editar gasto" : "Agregar gasto"}</h2>
          </div>
          <button class="icon-btn" data-action="close-modal" aria-label="Cerrar">${icon("x")}</button>
        </div>
        <form class="form-stack" data-form="expense" data-id="${movement?.id || ""}">
          <label>Monto
            <input name="amount" inputmode="decimal" type="number" min="0.01" step="0.01" required placeholder="0" value="${movement?.amount || ""}" />
          </label>
          <label>Categoria
            <select name="category" required>
              ${settings.categories.map((category) => `<option ${movement?.category === category ? "selected" : ""}>${category}</option>`).join("")}
            </select>
          </label>
          <div class="chip-row">
            ${settings.categories
              .slice(0, 8)
              .map((category) => `<button type="button" class="chip" data-action="pick-category" data-category="${category}">${category}</button>`)
              .join("")}
          </div>
          <label>Crear categoria nueva
            <input name="newCategory" type="text" placeholder="Ej: Mascotas" />
          </label>
          <label>Descripcion opcional
            <input name="description" type="text" placeholder="Ej: cafe, farmacia, nafta" value="${movement?.description || ""}" />
          </label>
          <div class="two-col">
            <label>Fecha
              <input name="date" type="date" required value="${movement?.date || todayISO()}" />
            </label>
            <label>Medio de pago
              <select name="paymentMethod" required>
                ${settings.paymentMethods.map((method) => `<option ${movement?.paymentMethod === method ? "selected" : ""}>${method}</option>`).join("")}
              </select>
            </label>
          </div>
          <label>Nota rapida
            <textarea name="note" rows="2" placeholder="Detalle opcional">${movement?.note || ""}</textarea>
          </label>
          <div class="switch-row">
            <label class="switch"><input name="recurringEnabled" type="checkbox" ${recurring.enabled ? "checked" : ""} /> <span>Gasto recurrente</span></label>
            <select name="frequency">
              <option value="daily" ${recurring.frequency === "daily" ? "selected" : ""}>Diario</option>
              <option value="weekly" ${recurring.frequency === "weekly" ? "selected" : ""}>Semanal</option>
              <option value="monthly" ${!recurring.frequency || recurring.frequency === "monthly" ? "selected" : ""}>Mensual</option>
            </select>
          </div>
          <button class="primary-btn" type="submit">${icon("check")} Guardar gasto</button>
        </form>
      </div>
    </div>
  `;
};
