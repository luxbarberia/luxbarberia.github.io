import { icon } from "./icons.js";

export const InstallPrompt = ({ installAvailable, isStandalone }) => {
  if (isStandalone) return "";
  return `
    <section class="install-card soft-card">
      <div>
        <span class="eyebrow">${icon("download")} PWA lista</span>
        <h3>Instalala en tu pantalla de inicio</h3>
        <p>En Android aparece el boton de instalar. En iPhone: compartir, luego Agregar a pantalla de inicio.</p>
      </div>
      <button class="ghost-btn" data-action="install" ${installAvailable ? "" : "disabled"}>${icon("download")} Instalar</button>
    </section>
  `;
};
