import { Dashboard } from "./Dashboard.js";
import { AddExpenseModal } from "./AddExpenseModal.js";
import { AddIncomeModal } from "./AddIncomeModal.js";
import { MovementsList } from "./MovementsList.js";
import { BudgetPanel } from "./BudgetPanel.js";
import { PredictionPanel } from "./PredictionPanel.js";
import { SettingsPanel } from "./SettingsPanel.js";
import { CalculatorModal } from "./CalculatorModal.js";
import { InstallPrompt } from "./InstallPrompt.js";
import { AuthPanel } from "./AuthPanel.js";
import { icon } from "./icons.js";
import { getDashboardMetrics, money } from "./calculations.js";
import { todayISO } from "./dateUtils.js";
import { exportCSV, exportJSON, loadState, normalizeState, resetState, saveState } from "./storage.js";
import {
  cloudSignIn,
  cloudSignOut,
  cloudSignUp,
  fetchRemoteState,
  isCloudConfigured,
  loadCloudSession,
  saveRemoteState
} from "./cloud.js";

export class App {
  constructor(root) {
    this.root = root;
    this.state = loadState();
    this.ui = {
      view: "dashboard",
      modal: null,
      editingId: null,
      toast: "",
      showAuth: !loadCloudSession(),
      localOnly: false,
      cloudSession: loadCloudSession(),
      cloudSync: "idle",
      auth: { mode: "signin", login: "" },
      filters: { period: "month", from: todayISO(), to: todayISO(), category: "", paymentMethod: "" },
      calculator: { tab: "quick" },
      installEvent: null,
      saving: false
    };
  }

  start() {
    this.bindInstallPrompt();
    this.restoreCloudSession();
    this.render();
    this.root.addEventListener("click", (event) => this.handleClick(event));
    this.root.addEventListener("submit", (event) => this.handleSubmit(event));
    this.root.addEventListener("change", (event) => this.handleChange(event));
    this.root.addEventListener("input", (event) => this.handleInput(event));
  }

  async restoreCloudSession() {
    if (!this.ui.cloudSession || !isCloudConfigured()) return;
    try {
      this.ui.cloudSync = "syncing";
      const remote = await fetchRemoteState(this.ui.cloudSession);
      if (remote) {
        this.state = normalizeState(remote);
        saveState(this.state);
      } else {
        await saveRemoteState(this.ui.cloudSession, this.state);
      }
      this.ui.showAuth = false;
      this.ui.cloudSync = "synced";
      this.render();
    } catch {
      this.ui.cloudSync = "error";
      this.render();
    }
  }

  bindInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();
      this.ui.installEvent = event;
      this.render();
    });
  }

  render() {
    const metrics = getDashboardMetrics(this.state.movements, this.state.settings);
    const viewState = {
      ...this.state,
      metrics,
      filters: this.ui.filters,
      calculator: this.ui.calculator
    };
    document.documentElement.dataset.theme = this.state.settings.theme;
    this.root.innerHTML = `
      <main class="app-shell">
        <header class="topbar">
          <div>
            <span class="app-mark">${icon("wallet")}</span>
            <strong>FindeMes</strong>
          </div>
          <button class="icon-btn" data-action="open-calculator" aria-label="Calculadora">${icon("calculator")}</button>
        </header>
        <div class="content">
          ${
            this.ui.showAuth && !this.ui.localOnly
              ? AuthPanel({
                  auth: {
                    ...this.ui.auth,
                    cloudReady: isCloudConfigured()
                  }
                })
              : `${InstallPrompt({
                  installAvailable: Boolean(this.ui.installEvent),
                  isStandalone: window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone
                })}
                ${this.renderCloudBar()}
                ${this.renderView(viewState)}`
          }
        </div>
        ${this.ui.showAuth && !this.ui.localOnly ? "" : this.renderBottomNav()}
        ${this.ui.showAuth && !this.ui.localOnly ? "" : this.renderFloatingAction()}
        ${this.renderModal()}
        ${this.ui.toast ? `<div class="toast">${this.ui.toast}</div>` : ""}
      </main>
    `;
  }

  renderCloudBar() {
    const connected = Boolean(this.ui.cloudSession && isCloudConfigured());
    const label = connected
      ? this.ui.cloudSync === "syncing"
        ? "Sincronizando..."
        : this.ui.cloudSync === "error"
          ? "Nube con error"
          : `Cuenta: ${this.ui.cloudSession.email}`
      : "Modo local";
    return `
      <section class="cloud-bar ${connected ? "connected" : "local"}">
        <span>${icon(connected ? "check" : "home")} ${label}</span>
        ${
          connected
            ? `<button class="ghost-btn small" data-action="sync-now">Sincronizar</button><button class="ghost-btn small" data-action="sign-out">Salir</button>`
            : `<button class="ghost-btn small" data-action="show-auth">Conectar</button>`
        }
      </section>
    `;
  }

  renderView(viewState) {
    if (this.ui.view === "movements") return MovementsList({ state: viewState });
    if (this.ui.view === "budget") return BudgetPanel({ state: viewState });
    if (this.ui.view === "prediction") return PredictionPanel({ state: viewState });
    if (this.ui.view === "settings") return SettingsPanel({ state: viewState });
    return Dashboard({ state: viewState });
  }

  renderBottomNav() {
    const items = [
      ["dashboard", "home", "Inicio"],
      ["movements", "list", "Movs"],
      ["budget", "target", "Presup."],
      ["prediction", "chart", "Predic."],
      ["settings", "settings", "Ajustes"]
    ];
    return `
      <nav class="bottom-nav">
        ${items
          .map(
            ([view, iconName, label]) => `
              <button data-nav="${view}" class="${this.ui.view === view ? "active" : ""}">
                ${icon(iconName)}<span>${label}</span>
              </button>
            `
          )
          .join("")}
      </nav>
    `;
  }

  renderFloatingAction() {
    return `
      <div class="floating-actions">
        <button class="float-btn income" data-action="open-income" aria-label="Agregar ingreso">${icon("plus")}</button>
        <button class="float-btn" data-action="open-expense" aria-label="Agregar gasto">${icon("minus")}</button>
      </div>
    `;
  }

  renderModal() {
    const movement = this.state.movements.find((item) => item.id === this.ui.editingId);
    if (this.ui.modal === "expense") return AddExpenseModal({ settings: this.state.settings, movement });
    if (this.ui.modal === "income") return AddIncomeModal({ movement });
    if (this.ui.modal === "calculator") return CalculatorModal({ settings: this.state.settings, calculator: this.ui.calculator });
    if (this.ui.modal === "delete") return this.confirmModal("Eliminar movimiento", "Esta accion recalcula tus saldos y no se puede deshacer.", "delete-movement", "Eliminar");
    if (this.ui.modal === "reset") return this.confirmModal("Resetear datos", "Se borraran movimientos, presupuestos y categorias personalizadas.", "reset-data", "Resetear");
    if (this.ui.modal === "note") return this.noteModal(movement);
    return "";
  }

  confirmModal(title, message, action, label) {
    return `
      <div class="modal-shell" role="dialog" aria-modal="true">
        <div class="modal-card compact-modal">
          <div class="modal-head">
            <div><span class="eyebrow">${icon("alert")} Confirmacion</span><h2>${title}</h2></div>
            <button class="icon-btn" data-action="close-modal" aria-label="Cerrar">${icon("x")}</button>
          </div>
          <p>${message}</p>
          <div class="button-grid two">
            <button class="ghost-btn" data-action="close-modal">Cancelar</button>
            <button class="primary-btn danger" data-action="${action}">${icon("trash")} ${label}</button>
          </div>
        </div>
      </div>
    `;
  }

  noteModal(movement) {
    return `
      <div class="modal-shell" role="dialog" aria-modal="true">
        <div class="modal-card compact-modal">
          <div class="modal-head">
            <div><span class="eyebrow">${icon("note")} Nota rapida</span><h2>${movement?.description || movement?.category || "Movimiento"}</h2></div>
            <button class="icon-btn" data-action="close-modal" aria-label="Cerrar">${icon("x")}</button>
          </div>
          <form class="form-stack" data-form="note" data-id="${movement?.id || ""}">
            <label>Nota
              <textarea name="note" rows="5" placeholder="Agrega un detalle util">${movement?.note || ""}</textarea>
            </label>
            <button class="primary-btn" type="submit">${icon("check")} Guardar nota</button>
          </form>
        </div>
      </div>
    `;
  }

  handleClick(event) {
    const button = event.target.closest("button, [data-action], [data-nav], [data-filter-period]");
    if (!button) return;

    const nav = button.dataset.nav;
    if (nav) {
      this.ui.view = nav;
      this.ui.modal = null;
      this.render();
      return;
    }

    if (button.dataset.filterPeriod) {
      this.ui.filters.period = button.dataset.filterPeriod;
      this.render();
      return;
    }

    const action = button.dataset.action;
    if (!action) return;

    const actions = {
      "open-expense": () => this.openModal("expense"),
      "open-income": () => this.openModal("income"),
      "open-calculator": () => this.openModal("calculator"),
      "auth-mode": () => this.setAuthMode(button.dataset.mode),
      "use-local": () => this.useLocal(),
      "show-auth": () => this.showAuth(),
      "sign-out": () => this.signOut(),
      "sync-now": () => this.syncNow(),
      "close-modal": () => this.openModal(null),
      "toggle-theme": () => this.updateSettings({ theme: this.state.settings.theme === "dark" ? "light" : "dark" }),
      "pick-category": () => this.pickCategory(button.dataset.category),
      "edit-movement": () => this.editMovement(button.dataset.id),
      "confirm-delete": () => this.confirmDelete(button.dataset.id),
      "delete-movement": () => this.deleteMovement(),
      "confirm-reset": () => this.openModal("reset"),
      "reset-data": () => this.resetData(),
      "save-budget": () => this.saveBudgetFromScreen(),
      "export-json": () => exportJSON(this.state),
      "export-csv": () => exportCSV(this.state.movements),
      "remove-category": () => this.removeCategory(button.dataset.category),
      "toggle-recurring": () => this.toggleRecurring(button.dataset.id),
      "open-note": () => this.openNote(button.dataset.id),
      install: () => this.installApp(),
      "calculator-tab": () => this.setCalculatorTab(button.dataset.tab)
    };

    actions[action]?.();
  }

  handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const type = form.dataset.form;
    if (type === "expense") this.saveMovement(form, "expense");
    if (type === "income") this.saveMovement(form, "income");
    if (type === "auth") this.submitAuth(form);
    if (type === "settings") this.saveSettings(form);
    if (type === "budget" || type === "category-budgets") this.saveBudgetFromScreen();
    if (type === "add-category") this.addCategory(form);
    if (type === "note") this.saveNote(form);
  }

  handleChange(event) {
    const target = event.target;
    if (target.dataset.filter) {
      this.ui.filters[target.dataset.filter] = target.value;
      this.render();
    }
    if (target.dataset.action === "import-json" && target.files?.[0]) {
      this.importBackup(target.files[0]);
    }
  }

  handleInput(event) {
    const target = event.target;
    if (target.dataset.calc !== undefined) {
      this.ui.calculator[target.name] = target.value;
      this.render();
    }
  }

  setAuthMode(mode) {
    this.ui.auth.mode = mode || "signin";
    this.render();
  }

  useLocal() {
    this.ui.localOnly = true;
    this.ui.showAuth = false;
    this.render();
  }

  showAuth() {
    this.ui.localOnly = false;
    this.ui.showAuth = true;
    this.render();
  }

  async submitAuth(form) {
    const data = Object.fromEntries(new FormData(form));
    if (!isCloudConfigured()) {
      this.toast("Primero hay que conectar Supabase para usar nube");
      return;
    }
    try {
      this.ui.cloudSync = "syncing";
      this.render();
      const action = this.ui.auth.mode === "signup" ? cloudSignUp : cloudSignIn;
      const session = await action({ login: data.login, password: data.password });
      this.ui.cloudSession = session;
      const remote = await fetchRemoteState(session);
      if (remote) {
        this.state = normalizeState(remote);
        saveState(this.state);
      } else {
        await saveRemoteState(session, this.state);
      }
      this.ui.showAuth = false;
      this.ui.localOnly = false;
      this.ui.cloudSync = "synced";
      this.toast("Cuenta conectada");
      this.render();
    } catch (error) {
      this.ui.cloudSync = "error";
      this.toast(error.message || "No se pudo entrar");
      this.render();
    }
  }

  signOut() {
    cloudSignOut();
    this.ui.cloudSession = null;
    this.ui.cloudSync = "idle";
    this.toast("Sesion cerrada");
    this.render();
  }

  async syncNow() {
    if (!this.ui.cloudSession || !isCloudConfigured()) return;
    try {
      this.ui.cloudSync = "syncing";
      this.render();
      await saveRemoteState(this.ui.cloudSession, this.state);
      this.ui.cloudSync = "synced";
      this.toast("Datos sincronizados");
      this.render();
    } catch (error) {
      this.ui.cloudSync = "error";
      this.toast(error.message || "No se pudo sincronizar");
      this.render();
    }
  }

  openModal(modal) {
    this.ui.modal = modal;
    this.ui.editingId = modal ? this.ui.editingId : null;
    this.render();
  }

  saveMovement(form, type) {
    if (this.ui.saving) return;
    this.ui.saving = true;
    const data = Object.fromEntries(new FormData(form));
    const amount = Number(data.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      this.toast("Ingresa un monto valido");
      this.ui.saving = false;
      return;
    }

    const id = form.dataset.id || crypto.randomUUID();
    const existing = this.state.movements.find((item) => item.id === id);
    const newCategory = String(data.newCategory || "").trim();
    if (type === "expense" && newCategory) this.ensureCategory(newCategory);

    const movement = {
      id,
      type,
      amount,
      category: type === "expense" ? newCategory || data.category : "",
      description: String(data.description || "").trim(),
      date: data.date || todayISO(),
      paymentMethod: type === "expense" ? data.paymentMethod : "",
      note: String(data.note || existing?.note || "").trim(),
      recurring: {
        enabled: data.recurringEnabled === "on",
        frequency: data.frequency || "monthly",
        paused: existing?.recurring?.paused || false
      },
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.state.movements = existing
      ? this.state.movements.map((item) => (item.id === id ? movement : item))
      : [movement, ...this.state.movements];
    this.persist(`${type === "expense" ? "Gasto" : "Ingreso"} guardado`);
    this.ui.modal = null;
    this.ui.editingId = null;
    this.ui.saving = false;
    this.render();
  }

  saveSettings(form) {
    const data = Object.fromEntries(new FormData(form));
    this.updateSettings({
      currency: data.currency || "ARS",
      monthlyBudget: Number(data.monthlyBudget || 0),
      theme: data.darkMode === "on" ? "dark" : "light"
    });
  }

  saveBudgetFromScreen() {
    const budgetForm = this.root.querySelector('[data-form="budget"]');
    const categoryForm = this.root.querySelector('[data-form="category-budgets"]');
    const monthlyBudget = budgetForm ? Number(new FormData(budgetForm).get("monthlyBudget") || 0) : this.state.settings.monthlyBudget;
    const categoryBudgets = { ...this.state.settings.categoryBudgets };
    if (categoryForm) {
      const data = Object.fromEntries(new FormData(categoryForm));
      Object.keys(data).forEach((category) => {
        categoryBudgets[category] = Number(data[category] || 0);
      });
    }
    this.updateSettings({ monthlyBudget, categoryBudgets }, "Presupuesto guardado");
  }

  addCategory(form) {
    const data = Object.fromEntries(new FormData(form));
    const category = String(data.category || "").trim();
    if (!category) return;
    this.ensureCategory(category);
    this.persist("Categoria agregada");
    this.render();
  }

  removeCategory(category) {
    const inUse = this.state.movements.some((item) => item.category === category);
    if (inUse) {
      this.toast("No se puede eliminar una categoria en uso");
      return;
    }
    this.state.settings.categories = this.state.settings.categories.filter((item) => item !== category);
    delete this.state.settings.categoryBudgets[category];
    this.persist("Categoria eliminada");
    this.render();
  }

  editMovement(id) {
    const movement = this.state.movements.find((item) => item.id === id);
    if (!movement) return;
    this.ui.editingId = id;
    this.ui.modal = movement.type === "expense" ? "expense" : "income";
    this.render();
  }

  confirmDelete(id) {
    this.ui.editingId = id;
    this.ui.modal = "delete";
    this.render();
  }

  deleteMovement() {
    this.state.movements = this.state.movements.filter((item) => item.id !== this.ui.editingId);
    this.persist("Movimiento eliminado");
    this.ui.modal = null;
    this.ui.editingId = null;
    this.render();
  }

  openNote(id) {
    this.ui.editingId = id;
    this.ui.modal = "note";
    this.render();
  }

  saveNote(form) {
    const id = form.dataset.id;
    const note = String(new FormData(form).get("note") || "").trim();
    this.state.movements = this.state.movements.map((item) => (item.id === id ? { ...item, note, updatedAt: new Date().toISOString() } : item));
    this.persist("Nota guardada");
    this.ui.modal = null;
    this.ui.editingId = null;
    this.render();
  }

  toggleRecurring(id) {
    this.state.movements = this.state.movements.map((item) =>
      item.id === id ? { ...item, recurring: { ...item.recurring, paused: !item.recurring.paused } } : item
    );
    this.persist("Recurrente actualizado");
    this.render();
  }

  resetData() {
    this.state = resetState();
    this.persist("Datos reseteados");
    this.ui.modal = null;
    this.render();
  }

  async importBackup(file) {
    try {
      const text = await file.text();
      this.state = normalizeState(JSON.parse(text));
      this.persist("Backup importado");
      this.render();
    } catch {
      this.toast("No se pudo importar el backup");
    }
  }

  async installApp() {
    if (!this.ui.installEvent) return;
    this.ui.installEvent.prompt();
    await this.ui.installEvent.userChoice;
    this.ui.installEvent = null;
    this.render();
  }

  setCalculatorTab(tab) {
    this.ui.calculator = { tab };
    this.render();
  }

  pickCategory(category) {
    const select = this.root.querySelector('select[name="category"]');
    if (select) select.value = category;
  }

  ensureCategory(category) {
    if (!this.state.settings.categories.includes(category)) {
      this.state.settings.categories = [...this.state.settings.categories, category];
    }
  }

  updateSettings(settings, message = "Configuracion guardada") {
    this.state.settings = { ...this.state.settings, ...settings };
    this.persist(message);
    this.render();
  }

  persist(message) {
    const result = saveState(this.state);
    this.toast(result.ok ? message : "No se pudo guardar");
    if (result.ok) this.syncSilently();
  }

  toast(message) {
    this.ui.toast = message;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => {
      this.ui.toast = "";
      this.render();
    }, 2200);
  }

  async syncSilently() {
    if (!this.ui.cloudSession || !isCloudConfigured()) return;
    try {
      this.ui.cloudSync = "syncing";
      await saveRemoteState(this.ui.cloudSession, this.state);
      this.ui.cloudSync = "synced";
    } catch {
      this.ui.cloudSync = "error";
    }
  }
}
