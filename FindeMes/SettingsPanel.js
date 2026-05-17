import { icon } from "./icons.js";
import { CategoryManager } from "./CategoryManager.js";
import { RecurringExpensesPanel } from "./RecurringExpensesPanel.js";

export const SettingsPanel = ({ state }) => {
  const { settings } = state;
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon("settings")} Preferencias</span>
        <h1>Configuracion</h1>
      </div>
    </section>

    <section class="card">
      <form class="form-stack compact" data-form="settings">
        <label>Moneda
          <select name="currency">
            ${["ARS", "USD", "EUR", "BRL", "CLP", "UYU"]
              .map((currency) => `<option value="${currency}" ${settings.currency === currency ? "selected" : ""}>${currency}</option>`)
              .join("")}
          </select>
        </label>
        <label>Presupuesto mensual
          <input name="monthlyBudget" type="number" min="0" step="1" inputmode="decimal" value="${settings.monthlyBudget || ""}" />
        </label>
        <div class="switch-row">
          <label class="switch"><input name="darkMode" type="checkbox" ${settings.theme === "dark" ? "checked" : ""} /> <span>Modo oscuro</span></label>
          <button class="primary-btn compact-btn" type="submit">${icon("check")} Guardar</button>
        </div>
      </form>
    </section>

    ${CategoryManager({ settings })}
    ${RecurringExpensesPanel({ state })}

    <section class="card danger-zone">
      <div class="section-head">
        <div>
          <span class="eyebrow">Datos</span>
          <h2>Backup y limpieza</h2>
        </div>
      </div>
      <div class="button-grid">
        <button class="ghost-btn" data-action="export-json">${icon("download")} Exportar JSON</button>
        <button class="ghost-btn" data-action="export-csv">${icon("download")} Exportar CSV</button>
        <label class="ghost-btn upload-label">${icon("upload")} Importar backup<input type="file" accept="application/json" data-action="import-json" hidden /></label>
        <button class="ghost-btn danger" data-action="confirm-reset">${icon("trash")} Resetear datos</button>
      </div>
    </section>
  `;
};
