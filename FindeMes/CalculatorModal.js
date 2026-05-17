import { icon } from "./icons.js";
import { money } from "./calculations.js";

export const CalculatorModal = ({ settings, calculator }) => {
  const tab = calculator.tab || "quick";
  const result = getCalculatorResult(calculator, settings.currency);
  return `
    <div class="modal-shell" role="dialog" aria-modal="true">
      <div class="modal-card">
        <div class="modal-head">
          <div>
            <span class="eyebrow">${icon("calculator")} Herramientas</span>
            <h2>Calculadora rapida</h2>
          </div>
          <button class="icon-btn" data-action="close-modal" aria-label="Cerrar">${icon("x")}</button>
        </div>
        <div class="segmented">
          ${[
            ["quick", "Calc"],
            ["split", "Dividir"],
            ["installments", "Cuotas"],
            ["daily", "Por dia"]
          ]
            .map(([value, label]) => `<button data-action="calculator-tab" data-tab="${value}" class="${tab === value ? "active" : ""}">${label}</button>`)
            .join("")}
        </div>
        <form class="form-stack" data-form="calculator">
          <input type="hidden" name="tab" value="${tab}" />
          ${calculatorFields(tab, calculator)}
          <div class="result-box">
            <span>Resultado</span>
            <strong>${result}</strong>
          </div>
        </form>
      </div>
    </div>
  `;
};

const calculatorFields = (tab, calculator) => {
  if (tab === "split") {
    return `
      <label>Monto total <input data-calc name="amount" type="number" min="0" step="0.01" value="${calculator.amount || ""}" /></label>
      <label>Personas <input data-calc name="people" type="number" min="1" step="1" value="${calculator.people || 2}" /></label>
    `;
  }
  if (tab === "installments") {
    return `
      <label>Monto total <input data-calc name="amount" type="number" min="0" step="0.01" value="${calculator.amount || ""}" /></label>
      <label>Cantidad de cuotas <input data-calc name="installments" type="number" min="1" step="1" value="${calculator.installments || 3}" /></label>
      <label>Interes opcional (%) <input data-calc name="interest" type="number" min="0" step="0.01" value="${calculator.interest || ""}" /></label>
    `;
  }
  if (tab === "daily") {
    return `
      <label>Disponible <input data-calc name="amount" type="number" min="0" step="0.01" value="${calculator.amount || ""}" /></label>
      <label>Dias restantes <input data-calc name="days" type="number" min="1" step="1" value="${calculator.days || 7}" /></label>
    `;
  }
  return `
    <label>Cuenta rapida <input data-calc name="expression" type="text" inputmode="decimal" placeholder="Ej: 1200+350/2" value="${calculator.expression || ""}" /></label>
  `;
};

const getCalculatorResult = (calculator, currency) => {
  const amount = Number(calculator.amount || 0);
  if (calculator.tab === "split") {
    const people = Math.max(Number(calculator.people || 1), 1);
    return money(amount / people, currency);
  }
  if (calculator.tab === "installments") {
    const installments = Math.max(Number(calculator.installments || 1), 1);
    const interest = Number(calculator.interest || 0) / 100;
    return money((amount * (1 + interest)) / installments, currency);
  }
  if (calculator.tab === "daily") {
    const days = Math.max(Number(calculator.days || 1), 1);
    return money(amount / days, currency);
  }
  try {
    const expression = String(calculator.expression || "").replace(/[^0-9+\-*/()., ]/g, "").replaceAll(",", ".");
    if (!expression.trim()) return money(0, currency);
    const value = Function(`"use strict"; return (${expression})`)();
    return money(Number(value) || 0, currency);
  } catch {
    return "Revisa la cuenta";
  }
};
