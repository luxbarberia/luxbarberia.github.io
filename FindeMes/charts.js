import { money } from "./calculations.js";

export const barList = (items, currency, emptyText = "Sin datos todavia") => {
  const max = Math.max(...items.map((item) => item.value), 1);
  if (!items.length) return `<div class="empty mini">${emptyText}</div>`;
  return `
    <div class="bar-list">
      ${items
        .slice(0, 7)
        .map(
          (item) => `
            <div class="bar-row">
              <div class="bar-label"><span>${item.name}</span><strong>${money(item.value, currency)}</strong></div>
              <div class="bar-track"><span style="width:${Math.max((item.value / max) * 100, 5)}%"></span></div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
};

export const lineChart = (items, currency) => {
  if (!items.length) return `<div class="empty mini">Sin gastos este mes</div>`;
  const width = 320;
  const height = 120;
  const max = Math.max(...items.map((item) => item.value), 1);
  const points = items
    .map((item, index) => {
      const x = items.length === 1 ? 0 : (index / (items.length - 1)) * width;
      const y = height - (item.value / max) * (height - 14) - 7;
      return `${x},${y}`;
    })
    .join(" ");
  return `
    <div class="line-chart" aria-label="Evolucion diaria del gasto">
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
      </svg>
      <div class="chart-caption">
        <span>Inicio</span>
        <strong>${money(items.at(-1)?.value || 0, currency)}</strong>
        <span>Hoy</span>
      </div>
    </div>
  `;
};

export const donut = (used, total, currency) => {
  const ratio = total > 0 ? Math.min(used / total, 1) : 0;
  const degrees = Math.round(ratio * 360);
  return `
    <div class="donut" style="--degrees:${degrees}deg">
      <div>
        <strong>${Math.round(ratio * 100)}%</strong>
        <span>${money(Math.max(total - used, 0), currency)} libres</span>
      </div>
    </div>
  `;
};
