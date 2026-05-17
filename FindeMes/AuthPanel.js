import { icon } from "./icons.js";

export const AuthPanel = ({ auth }) => `
  <section class="auth-layout">
    <div class="auth-brand">
      <span class="app-mark large">${icon("wallet")}</span>
      <span class="eyebrow">FindeMes Cloud</span>
      <h1>Tu plata, sincronizada entre dispositivos.</h1>
      <p>Entra con usuario y contrasena para ver los mismos gastos en el celular y en la compu.</p>
    </div>

    <section class="card auth-card">
      <div class="segmented">
        <button data-action="auth-mode" data-mode="signin" class="${auth.mode === "signin" ? "active" : ""}">Entrar</button>
        <button data-action="auth-mode" data-mode="signup" class="${auth.mode === "signup" ? "active" : ""}">Crear cuenta</button>
      </div>
      <form class="form-stack" data-form="auth">
        <label>Usuario o email
          <input name="login" autocomplete="username" required placeholder="diego o diego@email.com" value="${auth.login || ""}" />
        </label>
        <label>Contrasena
          <input name="password" autocomplete="${auth.mode === "signup" ? "new-password" : "current-password"}" type="password" minlength="6" required placeholder="Minimo 6 caracteres" />
        </label>
        <button class="primary-btn" type="submit">${icon("check")} ${auth.mode === "signup" ? "Crear cuenta" : "Entrar"}</button>
      </form>
      ${
        auth.cloudReady
          ? `<p class="auth-note ok">${icon("check")} Sincronizacion en la nube lista.</p>`
          : `<p class="auth-note warning">${icon("alert")} Modo nube pendiente: falta conectar Supabase. Podes usar la app local ahora.</p>`
      }
      <button class="ghost-btn wide" data-action="use-local">${icon("home")} Usar solo en este dispositivo</button>
    </section>
  </section>
`;
