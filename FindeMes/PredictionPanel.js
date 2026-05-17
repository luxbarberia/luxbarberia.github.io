import { icon } from "./icons.js";
import { money } from "./calculations.js";
import { getPrediction } from "./prediction.js";

export const PredictionPanel = ({ state }) => {
  const { movements, settings } = state;
  const prediction = getPrediction(movements, settings);
  const currency = settings.currency;
  const riskClass = { bajo: "ok", medio: "warning", alto: "danger" }[prediction.risk];
  return `
    <section class="page-head">
      <div>
        <span class="eyebrow">${icon("chart")} Proyeccion local</span>
        <h1>Prediccion</h1>
      </div>
      <button class="fab-inline" data-action="open-calculator">${icon("calculator")}</button>
    </section>

    <section class="hero-card prediction">
      <span class="eyebrow">Gasto mensual proyectado</span>
      <h1>${money(prediction.projected, currency)}</h1>
      <div class="alert ${riskClass}">
        ${icon("alert")} Riesgo ${prediction.risk}: ${prediction.budget ? `${money(prediction.difference, currency)} contra presupuesto` : "defini un presupuesto para medir desvio"}.
      </div>
    </section>

    <section class="metric-grid">
      <article class="metric-card">
        <span>Promedio diario</span>
        <strong>${money(prediction.averageDaily, currency)}</strong>
      </article>
      <article class="metric-card">
        <span>Recurrentes pendientes</span>
        <strong>${money(prediction.recurringPendingTotal, currency)}</strong>
      </article>
      <article class="metric-card">
        <span>Dias restantes</span>
        <strong>${prediction.remainingDays}</strong>
      </article>
      <article class="metric-card">
        <span>Disponible por dia</span>
        <strong>${money(prediction.recommendedDaily, currency)}</strong>
      </article>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <span class="eyebrow">Recomendacion</span>
          <h2>Ritmo sugerido</h2>
        </div>
      </div>
      <p class="large-copy">Podes gastar aproximadamente <strong>${money(prediction.recommendedDaily, currency)}</strong> por dia para llegar bien a fin de mes.</p>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <span class="eyebrow">${icon("repeat")} Recurrentes</span>
          <h2>Incluidos en la prediccion</h2>
        </div>
      </div>
      ${
        prediction.pendingRecurring.length
          ? prediction.pendingRecurring
              .map(
                (item) => `
                  <div class="recurring-row">
                    <span>${item.description || item.category}<small>${item.occurrences} pendiente(s)</small></span>
                    <strong>${money(item.pendingAmount, currency)}</strong>
                  </div>
                `
              )
              .join("")
          : `<div class="empty mini">No hay gastos recurrentes pendientes este mes.</div>`
      }
    </section>
  `;
};
