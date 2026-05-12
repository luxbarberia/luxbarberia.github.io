const barbers = [
  { id: "franco", name: "Franco", role: "Cortes clásicos, fades y barba", color: "#c99d45" },
  { id: "vito", name: "Vito", role: "Diseño, perfilado y servicios completos", color: "#8a1f26" },
];

const services = [
  { id: "corte", name: "Corte", duration: 45, price: 8000, detail: "Perfilado, tijera o máquina." },
  { id: "barba", name: "Barba", duration: 30, price: 6000, detail: "Diseño, navaja y terminación." },
  { id: "combo", name: "Corte + barba", duration: 75, price: 12500, detail: "Servicio completo Lux." },
  { id: "perfilado", name: "Perfilado", duration: 20, price: 4500, detail: "Contornos y retoque rápido." },
];

const slots = ["10:00", "10:45", "11:30", "12:15", "14:15", "15:00", "15:45", "16:30", "17:15", "18:00", "18:45", "19:30"];
const bookingStoreKey = "lux-3-bookings";
const clientStoreKey = "lux-3-clients";
const activeClientKey = "lux-3-active-client";
const barberSessionKey = "lux-3-barber-session";
const barberPasswordStoreKey = "lux-3-barber-passwords";
const cloudConfigStoreKey = "lux-3-supabase-config";

const defaultClients = [
  { phone: "5491140228811", firstName: "Fede", lastName: "Martínez", notes: "Cliente frecuente de combo.", createdAt: todayISO(), source: "barber" },
  { phone: "5491167883044", firstName: "Mati", lastName: "Rojas", notes: "", createdAt: todayISO(), source: "barber" },
  { phone: "5491121907755", firstName: "Santi", lastName: "López", notes: "Prefiere turno tarde.", createdAt: todayISO(), source: "barber" },
];

const defaultBookings = [
  makeSeedBooking("demo-1", "franco", "combo", todayISO(), "11:30", "Fede Martínez", "5491140228811", "Quiere barba marcada.", "confirmed"),
  makeSeedBooking("demo-2", "vito", "corte", todayISO(), "15:00", "Mati Rojas", "5491167883044", "", "confirmed"),
  makeSeedBooking("demo-3", "franco", "barba", offsetDateISO(2), "18:00", "Santi López", "5491121907755", "Pasa después del trabajo.", "confirmed"),
  makeSeedBooking("demo-4", "vito", "corte", offsetDateISO(-25), "16:30", "Fede Martínez", "5491140228811", "Corte clásico.", "completed"),
];

const state = {
  view: "cliente",
  step: 1,
  barberId: barbers[0].id,
  serviceId: services[0].id,
  date: todayISO(),
  time: "",
  activePhone: localStorage.getItem(activeClientKey) || "",
  panelSelectedPhone: "",
  pendingPhone: "",
  weeklyBarberFilter: "all",
  barberSession: JSON.parse(sessionStorage.getItem(barberSessionKey) || "null"),
  deferredInstallPrompt: null,
  clients: readStoredList(clientStoreKey),
  bookings: readStoredList(bookingStoreKey),
  cloud: {
    client: null,
    enabled: false,
    loading: false,
    channel: null,
    refreshTimer: null,
  },
};

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const els = {
  viewButtons: document.querySelectorAll("[data-view]"),
  views: document.querySelectorAll(".view"),
  modeButtons: document.querySelectorAll(".mode-switch button"),
  barberAccessButton: document.querySelector("#barber-access-button"),
  barberLoginDialog: document.querySelector("#barber-login-dialog"),
  barberLoginForm: document.querySelector("#barber-login-form"),
  barberLoginSelect: document.querySelector("#barber-login-select"),
  barberLoginTitle: document.querySelector("#barber-login-title"),
  barberLoginHelp: document.querySelector("#barber-login-help"),
  barberPasswordLabel: document.querySelector("#barber-password-label"),
  barberPassword: document.querySelector("#barber-password"),
  barberPasswordConfirmField: document.querySelector("#barber-password-confirm-field"),
  barberPasswordConfirm: document.querySelector("#barber-password-confirm"),
  barberLoginError: document.querySelector("#barber-login-error"),
  closeBarberLogin: document.querySelector("#close-barber-login"),
  loginCard: document.querySelector("#login-card"),
  loginForm: document.querySelector("#login-form"),
  loginPhone: document.querySelector("#login-phone"),
  registerForm: document.querySelector("#register-form"),
  clientSession: document.querySelector("#client-session"),
  clientAccessTitle: document.querySelector("#client-access-title"),
  logoutClient: document.querySelector("#logout-client"),
  clientName: document.querySelector("#client-name"),
  clientPhoneLine: document.querySelector("#client-phone-line"),
  clientTotalVisits: document.querySelector("#client-total-visits"),
  clientTotalPaid: document.querySelector("#client-total-paid"),
  clientNextAppointment: document.querySelector("#client-next-appointment"),
  selectedClientName: document.querySelector("#selected-client-name"),
  selectedClientPhone: document.querySelector("#selected-client-phone"),
  selectedBarberName: document.querySelector("#selected-barber-name"),
  clientAppointments: document.querySelector("#client-appointments"),
  clientHistory: document.querySelector("#client-history"),
  barberList: document.querySelector("#barber-list"),
  serviceList: document.querySelector("#service-list"),
  slotList: document.querySelector("#slot-list"),
  bookingDate: document.querySelector("#booking-date"),
  bookingForm: document.querySelector("#booking-form"),
  steps: document.querySelectorAll(".step"),
  formSteps: document.querySelectorAll(".form-step"),
  backStep: document.querySelector("#back-step"),
  nextStep: document.querySelector("#next-step"),
  confirmBooking: document.querySelector("#confirm-booking"),
  summary: document.querySelector("#booking-summary"),
  successDialog: document.querySelector("#success-dialog"),
  successCopy: document.querySelector("#success-copy"),
  successWhatsapp: document.querySelector("#success-whatsapp"),
  closeDialog: document.querySelector("#close-dialog"),
  appointmentsList: document.querySelector("#appointments-list"),
  barberLedger: document.querySelector("#barber-ledger"),
  weeklyCalendar: document.querySelector("#weekly-calendar"),
  weeklyBarberFilter: document.querySelector("#weekly-barber-filter"),
  adminDialog: document.querySelector("#admin-dialog"),
  openAdmin: document.querySelector("#open-admin"),
  closeAdmin: document.querySelector("#close-admin"),
  logoutBarber: document.querySelector("#logout-barber"),
  barberSessionLabel: document.querySelector("#barber-session-label"),
  clientList: document.querySelector("#client-list"),
  barberClientForm: document.querySelector("#barber-client-form"),
  panelClientFile: document.querySelector("#panel-client-file"),
  selectedPanelClientStatus: document.querySelector("#selected-panel-client-status"),
  agendaFilter: document.querySelector("#agenda-filter"),
  metricToday: document.querySelector("#metric-today"),
  metricWeek: document.querySelector("#metric-week"),
  metricPending: document.querySelector("#metric-pending"),
  metricCompleted: document.querySelector("#metric-completed"),
  newDemoBooking: document.querySelector("#new-demo-booking"),
  exportClients: document.querySelector("#export-clients"),
  generatePromo: document.querySelector("#generate-promo"),
  promoText: document.querySelector("#promo-text"),
  promoWhatsapp: document.querySelector("#promo-whatsapp"),
  installButton: document.querySelector("#install-button"),
  cloudStatus: document.querySelector("#cloud-status"),
  cloudConfigForm: document.querySelector("#cloud-config-form"),
  cloudUrl: document.querySelector("#cloud-url"),
  cloudKey: document.querySelector("#cloud-key"),
  cloudDisconnect: document.querySelector("#cloud-disconnect"),
  cloudHelp: document.querySelector("#cloud-help"),
};

init();

async function init() {
  seedData();
  migrateBookings();
  els.bookingDate.min = todayISO();
  els.bookingDate.value = state.date;
  renderBarbers();
  renderServices();
  renderSlots();
  renderStep();
  renderAuth();
  renderBarberSession();
  renderPanel();
  updatePromoLink();
  bindEvents();
  registerServiceWorker();
  hydrateCloudForm();
  await connectCloud();
}

function bindEvents() {
  els.viewButtons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  els.barberAccessButton.addEventListener("click", () => {
    if (isBarberAuthenticated()) {
      setView("panel");
      return;
    }
    openBarberLogin();
  });

  els.barberLoginSelect.addEventListener("change", renderBarberLoginMode);

  els.barberLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(els.barberLoginForm);
    const password = String(form.get("password")).trim();
    const passwordConfirm = String(form.get("passwordConfirm")).trim();
    const barber = String(form.get("barber"));
    const savedPassword = getBarberPassword(barber);

    if (!savedPassword) {
      if (password.length < 4) {
        showBarberLoginError("La contraseña tiene que tener al menos 4 caracteres.");
        return;
      }

      if (password !== passwordConfirm) {
        showBarberLoginError("Las contraseñas no coinciden.");
        return;
      }

      saveBarberPassword(barber, password);
    } else if (!matchesBarberPassword(barber, password)) {
      showBarberLoginError("Contraseña incorrecta.");
      return;
    }

    state.barberSession = {
      role: barber,
      label: barber === "admin" ? "Administración" : getBarber(barber).name,
      startedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(barberSessionKey, JSON.stringify(state.barberSession));
    els.barberLoginDialog.close();
    els.barberLoginForm.reset();
    els.barberLoginError.hidden = true;
    renderBarberSession();
    setView("panel");
  });

  els.closeBarberLogin.addEventListener("click", () => {
    els.barberLoginDialog.close();
    els.barberLoginError.hidden = true;
  });

  els.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const phone = normalizePhone(new FormData(els.loginForm).get("phone"));
    if (!phone) return;

    const client = getClient(phone);
    state.pendingPhone = phone;

    if (client) {
      setActiveClient(phone);
      return;
    }

    els.registerForm.hidden = false;
    els.clientAccessTitle.textContent = "Crear cuenta Lux";
  });

  els.registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(els.registerForm);
    const client = upsertClient({
      phone: state.pendingPhone,
      firstName: String(form.get("firstName")).trim(),
      lastName: String(form.get("lastName")).trim(),
      notes: "",
      source: "client",
    });

    if (client) {
      els.registerForm.reset();
      setActiveClient(client.phone);
    }
  });

  els.logoutClient.addEventListener("click", () => {
    state.activePhone = "";
    localStorage.removeItem(activeClientKey);
    els.loginPhone.value = "";
    els.registerForm.reset();
    els.registerForm.hidden = true;
    renderAuth();
  });

  els.bookingDate.addEventListener("change", () => {
    state.date = els.bookingDate.value;
    state.time = "";
    renderSlots();
    updateSummary();
  });

  els.backStep.addEventListener("click", () => {
    state.step = Math.max(1, state.step - 1);
    renderStep();
  });

  els.nextStep.addEventListener("click", () => {
    if (!canAdvance()) return;
    state.step = Math.min(4, state.step + 1);
    renderStep();
  });

  els.bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const client = getActiveClient();
    if (!client || !state.time) return;

    const service = getService(state.serviceId);
    const form = new FormData(els.bookingForm);
    const booking = {
      id: crypto.randomUUID(),
      barberId: state.barberId,
      serviceId: state.serviceId,
      date: state.date,
      time: state.time,
      name: clientFullName(client),
      phone: client.phone,
      note: String(form.get("note")).trim(),
      paidAmount: service.price,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    saveBookings([...getBookings(), booking]);
    showSuccess(booking);
    resetBookingForm();
    renderAuth();
    renderPanel();
  });

  els.closeDialog.addEventListener("click", () => els.successDialog.close());
  els.agendaFilter.addEventListener("input", renderPanel);
  els.newDemoBooking.addEventListener("click", addDemoBooking);
  els.exportClients.addEventListener("click", copyClients);
  els.generatePromo.addEventListener("click", generatePromo);
  els.promoText.addEventListener("input", updatePromoLink);
  els.installButton.addEventListener("click", installApp);
  els.cloudConfigForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(els.cloudConfigForm);
    const config = {
      url: String(form.get("url")).trim(),
      anonKey: String(form.get("anonKey")).trim(),
    };

    if (!config.url || !config.anonKey) {
      setCloudStatus("Faltan datos", "Pegá la URL y la clave pública anon de Supabase.");
      return;
    }

    localStorage.setItem(cloudConfigStoreKey, JSON.stringify(config));
    await connectCloud({ replace: true });
  });
  els.cloudDisconnect.addEventListener("click", async () => {
    localStorage.removeItem(cloudConfigStoreKey);
    await disconnectCloud();
    hydrateCloudForm();
    renderAll();
  });
  els.openAdmin.addEventListener("click", () => {
    renderAdmin();
    els.adminDialog.showModal();
  });
  els.closeAdmin.addEventListener("click", () => els.adminDialog.close());
  els.logoutBarber.addEventListener("click", () => {
    state.barberSession = null;
    sessionStorage.removeItem(barberSessionKey);
    if (els.adminDialog.open) els.adminDialog.close();
    renderBarberSession();
    setView("cliente");
  });
  els.weeklyBarberFilter.addEventListener("change", () => {
    state.weeklyBarberFilter = els.weeklyBarberFilter.value;
    renderWeeklyCalendar();
  });

  els.barberClientForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(els.barberClientForm);
    const client = upsertClient({
      phone: normalizePhone(form.get("phone")),
      firstName: String(form.get("firstName")).trim(),
      lastName: String(form.get("lastName")).trim(),
      notes: "",
      source: "barber",
    });

    if (!client) return;
    state.panelSelectedPhone = client.phone;
    els.barberClientForm.reset();
    renderAdmin();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    state.deferredInstallPrompt = event;
    els.installButton.hidden = false;
  });
}

function renderAuth() {
  const client = getActiveClient();
  const isLoggedIn = Boolean(client);

  els.loginCard.hidden = isLoggedIn;
  els.clientSession.hidden = !isLoggedIn;
  els.clientAccessTitle.textContent = isLoggedIn ? "Reservá y gestioná tu cuenta" : "Ingresá con WhatsApp";

  if (!client) return;

  const fullName = clientFullName(client);
  els.clientName.textContent = fullName;
  els.clientPhoneLine.textContent = formatPhone(client.phone);
  els.selectedClientName.textContent = fullName;
  els.selectedClientPhone.textContent = formatPhone(client.phone);
  els.selectedBarberName.textContent = `Barbero: ${getBarber(state.barberId).name}`;
  renderClientDashboard(client);
}

function openBarberLogin() {
  els.barberLoginError.hidden = true;
  els.barberPassword.value = "";
  els.barberPasswordConfirm.value = "";
  renderBarberLoginMode();
  els.barberLoginDialog.showModal();
}

function renderBarberLoginMode() {
  const selectedRole = els.barberLoginSelect.value;
  const hasPassword = Boolean(getBarberPassword(selectedRole));
  const label = selectedRole === "admin" ? "Administración" : getBarber(selectedRole).name;

  els.barberLoginTitle.textContent = hasPassword ? `Entrar como ${label}` : `Crear clave para ${label}`;
  els.barberLoginHelp.textContent = hasPassword
    ? "Ingresá la contraseña de este acceso de barbero."
    : "Primera vez en este dispositivo: creá una contraseña para este acceso.";
  els.barberPasswordLabel.textContent = hasPassword ? "Contraseña" : "Nueva contraseña";
  els.barberPassword.placeholder = hasPassword ? "Clave del panel" : "Mínimo 4 caracteres";
  els.barberPasswordConfirmField.hidden = hasPassword;
  els.barberPasswordConfirm.required = !hasPassword;
  els.barberLoginError.hidden = true;
}

function showBarberLoginError(message) {
  els.barberLoginError.textContent = message;
  els.barberLoginError.hidden = false;
}

function isBarberAuthenticated() {
  return Boolean(state.barberSession);
}

function renderBarberSession() {
  const authenticated = isBarberAuthenticated();
  els.barberAccessButton.textContent = authenticated ? "Panel Lux" : "Barberos";
  els.barberAccessButton.classList.toggle("active", state.view === "panel" && authenticated);
  els.barberSessionLabel.textContent = authenticated
    ? `Sesión de barbero: ${state.barberSession.label}. Vista semanal y agenda del día.`
    : "Vista semanal y agenda del día para pantalla de barbería.";
}

function renderClientDashboard(client) {
  const bookings = getBookings()
    .filter((booking) => normalizePhone(booking.phone) === client.phone)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const activeBookings = bookings.filter((booking) => booking.status === "confirmed");
  const history = bookings.filter((booking) => booking.status !== "cancelled" && booking.date <= todayISO());
  const paid = history.reduce((total, booking) => total + (booking.paidAmount || getService(booking.serviceId).price), 0);
  const nextBooking = activeBookings.find((booking) => `${booking.date} ${booking.time}` >= `${todayISO()} 00:00`);

  els.clientTotalVisits.textContent = history.length;
  els.clientTotalPaid.textContent = formatter.format(paid);
  els.clientNextAppointment.textContent = nextBooking ? `${formatDate(nextBooking.date)} ${nextBooking.time}` : "Sin turno";

  els.clientAppointments.innerHTML = activeBookings.length
    ? activeBookings.map(clientAppointmentTemplate).join("")
    : `<p>No tenés turnos activos.</p>`;

  els.clientHistory.innerHTML = history.length
    ? history.map(historyTemplate).join("")
    : `<p>Todavía no hay cortes cargados en tu historial.</p>`;

  els.clientAppointments.querySelectorAll("[data-client-cancel]").forEach((button) => {
    button.addEventListener("click", () => cancelBooking(button.dataset.clientCancel, { force: false }));
  });

  els.clientAppointments.querySelectorAll("[data-client-reschedule]").forEach((button) => {
    button.addEventListener("click", () => rescheduleBooking(button.dataset.clientReschedule));
  });
}

function renderBarbers() {
  els.barberList.innerHTML = barbers
    .map((barber) => {
      const bookedToday = getBookings().filter((booking) => booking.barberId === barber.id && booking.date === state.date && booking.status === "confirmed").length;
      return `
        <button class="barber-option ${barber.id === state.barberId ? "active" : ""}" type="button" data-barber="${barber.id}">
          <span class="barber-avatar">${barber.name.slice(0, 1)}</span>
          <strong>${barber.name}</strong>
          <span>${barber.role}</span>
          <b>${bookedToday} turnos hoy</b>
        </button>
      `;
    })
    .join("");

  els.barberList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.barberId = button.dataset.barber;
      state.time = "";
      renderBarbers();
      renderSlots();
      updateSummary();
      renderAuth();
    });
  });
}

function renderServices() {
  els.serviceList.innerHTML = services
    .map((service) => `
      <button class="service-option ${service.id === state.serviceId ? "active" : ""}" type="button" data-service="${service.id}">
        <strong>${service.name}</strong>
        <span>${service.detail}</span>
        <b>${formatter.format(service.price)} · ${service.duration} min</b>
      </button>
    `)
    .join("");

  els.serviceList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.serviceId = button.dataset.service;
      renderServices();
      updateSummary();
    });
  });

  updateSummary();
}

function renderSlots() {
  const taken = new Set(
    getBookings()
      .filter((booking) => booking.barberId === state.barberId && booking.date === state.date && booking.status === "confirmed")
      .map((booking) => booking.time)
  );

  els.slotList.innerHTML = slots
    .map((slot) => `
      <button class="slot-button ${slot === state.time ? "active" : ""}" type="button" data-slot="${slot}" ${taken.has(slot) ? "disabled" : ""}>
        ${slot}
      </button>
    `)
    .join("");

  els.slotList.querySelectorAll("button:not(:disabled)").forEach((button) => {
    button.addEventListener("click", () => {
      state.time = button.dataset.slot;
      renderSlots();
      updateSummary();
    });
  });
}

function renderStep() {
  els.steps.forEach((step, index) => step.classList.toggle("active", index + 1 === state.step));
  els.formSteps.forEach((step) => step.classList.toggle("active", Number(step.dataset.step) === state.step));
  els.backStep.style.visibility = state.step === 1 ? "hidden" : "visible";
  els.nextStep.style.display = state.step === 4 ? "none" : "inline-flex";
  els.confirmBooking.style.display = state.step === 4 ? "inline-flex" : "none";
}

function renderPanel() {
  const query = els.agendaFilter.value.trim().toLowerCase();
  const bookings = getBookings()
    .filter((booking) => booking.status === "confirmed")
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const visible = bookings.filter((booking) => (
    booking.name.toLowerCase().includes(query) ||
    formatPhone(booking.phone).includes(query) ||
    getBarber(booking.barberId).name.toLowerCase().includes(query)
  ));

  els.appointmentsList.innerHTML = visible.length
    ? visible.map(appointmentTemplate).join("")
    : `<p>No hay turnos con ese filtro.</p>`;

  els.appointmentsList.querySelectorAll("[data-cancel]").forEach((button) => {
    button.addEventListener("click", () => cancelBooking(button.dataset.cancel, { force: true }));
  });

  els.appointmentsList.querySelectorAll("[data-complete]").forEach((button) => {
    button.addEventListener("click", () => completeBooking(button.dataset.complete));
  });

  renderMetrics(bookings);
  renderWeeklyCalendar();
}

function renderAdmin() {
  renderBarberLedger();
  renderClients();
  renderPanelClientFile();
}

function renderWeeklyCalendar() {
  const week = getCurrentWeekDates();
  const selectedBarbers = state.weeklyBarberFilter === "all" ? barbers : barbers.filter((barber) => barber.id === state.weeklyBarberFilter);
  const weekStart = week[0].iso;
  const weekEnd = week[week.length - 1].iso;
  const bookings = getBookings()
    .filter((booking) => booking.date >= weekStart && booking.date <= weekEnd && booking.status === "confirmed")
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  els.weeklyCalendar.innerHTML = week
    .map((day) => {
      const dayBookings = bookings.filter((booking) => booking.date === day.iso && selectedBarbers.some((barber) => barber.id === booking.barberId));
      return `
        <article class="calendar-day">
          <header>
            <strong>${day.label}</strong>
            <span>${day.short}</span>
          </header>
          <div class="calendar-stack">
            ${dayBookings.length ? dayBookings.map(calendarBookingTemplate).join("") : "<p>Libre</p>"}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderBarberLedger() {
  const completed = getBookings().filter((booking) => booking.status === "completed");
  els.barberLedger.innerHTML = barbers
    .map((barber) => {
      const barberBookings = completed.filter((booking) => booking.barberId === barber.id);
      const total = barberBookings.reduce((sum, booking) => sum + (booking.paidAmount || getService(booking.serviceId).price), 0);
      const todayCompleted = barberBookings.filter((booking) => booking.date === todayISO()).length;
      return `
        <article class="ledger-card">
          <div>
            <span class="barber-avatar small">${barber.name.slice(0, 1)}</span>
            <strong>${barber.name}</strong>
          </div>
          <b>${formatter.format(total)}</b>
          <span>${barberBookings.length} cortes terminados · ${todayCompleted} hoy</span>
        </article>
      `;
    })
    .join("");
}

function renderClients() {
  const clients = getClients();
  els.clientList.innerHTML = clients.length
    ? clients.map(clientRowTemplate).join("")
    : `<p>Todavía no hay clientes cargados.</p>`;

  els.clientList.querySelectorAll("[data-select-client]").forEach((button) => {
    button.addEventListener("click", () => {
      state.panelSelectedPhone = button.dataset.selectClient;
      renderAdmin();
    });
  });
}

function renderPanelClientFile() {
  const clients = getClients();
  const selected = getClient(state.panelSelectedPhone) || clients[0];

  if (!selected) {
    els.selectedPanelClientStatus.textContent = "Sin selección";
    els.panelClientFile.innerHTML = `<p>Cargá o seleccioná un cliente para ver su ficha.</p>`;
    return;
  }

  state.panelSelectedPhone = selected.phone;
  els.selectedPanelClientStatus.textContent = "Activo";

  const bookings = getBookings()
    .filter((booking) => normalizePhone(booking.phone) === selected.phone)
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  const paid = bookings
    .filter((booking) => booking.status !== "cancelled")
    .reduce((total, booking) => total + (booking.paidAmount || getService(booking.serviceId).price), 0);

  els.panelClientFile.innerHTML = `
    <div class="file-card">
      <strong>${clientFullName(selected)}</strong>
      <span>${formatPhone(selected.phone)}</span>
      <span>${bookings.length} movimientos · ${formatter.format(paid)}</span>
    </div>
    <div class="history-list">
      ${bookings.length ? bookings.map(historyTemplate).join("") : "<p>Sin historial todavía.</p>"}
    </div>
  `;
}

function appointmentTemplate(booking) {
  const service = getService(booking.serviceId);
  const barber = getBarber(booking.barberId);
  const reminderHref = waLink(booking.phone, buildReminderMessage(booking));
  return `
    <article class="appointment">
      <time datetime="${booking.date}T${booking.time}">${booking.time}</time>
      <div>
        <strong>${booking.name}</strong>
        <span>${formatDate(booking.date)} · ${barber.name} · ${service.name} · ${formatter.format(service.price)}</span>
        <span>WhatsApp: ${formatPhone(booking.phone)} · ${booking.note || "Sin nota"}</span>
      </div>
      <div class="appointment-actions">
        <a class="whatsapp-button" href="${reminderHref}" target="_blank" rel="noreferrer" title="Abrir WhatsApp con recordatorio" aria-label="Abrir WhatsApp con recordatorio">WhatsApp</a>
        <button class="mini-button success" type="button" data-complete="${booking.id}" title="Trabajo terminado" aria-label="Marcar corte terminado">OK</button>
        <button class="mini-button danger" type="button" data-cancel="${booking.id}" title="Cancelar" aria-label="Cancelar turno">X</button>
      </div>
    </article>
  `;
}

function calendarBookingTemplate(booking) {
  const service = getService(booking.serviceId);
  const barber = getBarber(booking.barberId);
  return `
    <div class="calendar-booking" style="border-left-color: ${barber.color}">
      <strong>${booking.time} · ${barber.name}</strong>
      <span>${booking.name}</span>
      <span>${service.name}</span>
    </div>
  `;
}

function clientRowTemplate(client) {
  const bookings = getBookings().filter((booking) => normalizePhone(booking.phone) === client.phone && booking.status !== "cancelled");
  const last = bookings.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))[0];
  return `
    <button class="client-row ${client.phone === state.panelSelectedPhone ? "active" : ""}" type="button" data-select-client="${client.phone}">
      <div>
        <strong>${clientFullName(client)}</strong>
        <span>${formatPhone(client.phone)}</span>
      </div>
      <span>${last ? `${getBarber(last.barberId).name} · ${getService(last.serviceId).name}` : "Nuevo"}</span>
    </button>
  `;
}

function clientAppointmentTemplate(booking) {
  const service = getService(booking.serviceId);
  const locked = !canClientModify(booking);
  return `
    <article class="client-appointment">
      <div>
        <strong>${formatDate(booking.date)} · ${booking.time}</strong>
        <span>${getBarber(booking.barberId).name} · ${service.name} · ${formatter.format(service.price)}</span>
        <span>${locked ? "Cambios cerrados: falta menos de 1 hora." : "Podés cancelar o reprogramar hasta 1 hora antes."}</span>
      </div>
      <div class="appointment-actions">
        <button class="secondary compact" type="button" data-client-reschedule="${booking.id}" ${locked ? "disabled" : ""}>Reprogramar</button>
        <button class="secondary compact" type="button" data-client-cancel="${booking.id}" ${locked ? "disabled" : ""}>Cancelar</button>
      </div>
    </article>
  `;
}

function historyTemplate(booking) {
  const service = getService(booking.serviceId);
  const statusLabel = booking.status === "cancelled" ? "Cancelado" : booking.status === "completed" ? "Realizado" : "Reservado";
  return `
    <article class="history-item">
      <div>
        <strong>${service.name}</strong>
        <span>${formatDate(booking.date)} · ${booking.time} · ${getBarber(booking.barberId).name} · ${statusLabel}</span>
      </div>
      <b>${formatter.format(booking.paidAmount || service.price)}</b>
    </article>
  `;
}

function renderMetrics(bookings) {
  const today = todayISO();
  const weekLimit = offsetDateISO(7);
  const todayBookings = bookings.filter((booking) => booking.date === today);
  const weekBookings = bookings.filter((booking) => booking.date >= today && booking.date <= weekLimit);
  const completedToday = getBookings().filter((booking) => booking.date === today && booking.status === "completed");

  els.metricToday.textContent = todayBookings.length;
  els.metricWeek.textContent = weekBookings.length;
  els.metricPending.textContent = todayBookings.length;
  els.metricCompleted.textContent = completedToday.length;
}

function updateSummary() {
  const service = getService(state.serviceId);
  const barber = getBarber(state.barberId);
  const parts = [barber.name, service.name, formatter.format(service.price), `${service.duration} min`];
  if (state.date) parts.push(formatDate(state.date));
  if (state.time) parts.push(state.time);
  els.summary.textContent = parts.join(" · ");
}

function canAdvance() {
  if (state.step === 1) return Boolean(state.barberId);
  if (state.step === 2) return Boolean(state.serviceId);
  if (state.step === 3) return Boolean(state.date && state.time);
  return true;
}

function setView(view) {
  if (view === "panel" && !isBarberAuthenticated()) {
    openBarberLogin();
    return;
  }

  state.view = view;
  els.views.forEach((section) => section.classList.toggle("active", section.id === `${view}-view`));
  els.modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  els.barberAccessButton.classList.toggle("active", view === "panel" && isBarberAuthenticated());
  if (view === "panel") renderPanel();
}

function showSuccess(booking) {
  const service = getService(booking.serviceId);
  const barber = getBarber(booking.barberId);
  els.successCopy.textContent = `${booking.name}, tu turno quedó confirmado para el ${formatDate(booking.date)} a las ${booking.time} con ${barber.name} para ${service.name}. En unos momentos te enviaremos un recordatorio por WhatsApp.`;
  els.successWhatsapp.hidden = true;
  els.successDialog.showModal();
}

function resetBookingForm() {
  els.bookingForm.reset();
  state.step = 1;
  state.date = todayISO();
  state.time = "";
  els.bookingDate.value = state.date;
  renderBarbers();
  renderSlots();
  renderStep();
  updateSummary();
}

function cancelBooking(id, options = { force: false }) {
  const booking = getBookings().find((item) => item.id === id);
  if (!booking) return;
  if (!options.force && !canClientModify(booking)) return;

  const bookings = getBookings().map((item) => (
    item.id === id ? { ...item, status: "cancelled", cancelledAt: new Date().toISOString() } : item
  ));
  saveBookings(bookings);
  renderAuth();
  renderPanel();
  if (els.adminDialog.open) renderAdmin();
  renderSlots();
}

function completeBooking(id) {
  const bookings = getBookings().map((booking) => {
    if (booking.id !== id) return booking;
    return {
      ...booking,
      status: "completed",
      paidAmount: booking.paidAmount || getService(booking.serviceId).price,
      completedAt: new Date().toISOString(),
    };
  });
  saveBookings(bookings);
  renderAuth();
  renderPanel();
  if (els.adminDialog.open) renderAdmin();
  renderSlots();
}

function rescheduleBooking(id) {
  const booking = getBookings().find((item) => item.id === id);
  if (!booking || !canClientModify(booking)) return;

  cancelBooking(id, { force: false });
  state.barberId = booking.barberId;
  state.serviceId = booking.serviceId;
  state.date = booking.date;
  state.time = "";
  state.step = 3;
  els.bookingDate.value = booking.date;
  setView("cliente");
  renderBarbers();
  renderServices();
  renderSlots();
  renderStep();
  updateSummary();
  els.clientAppointments.innerHTML = `<p>Elegí un nuevo horario arriba y confirmá el turno otra vez.</p>`;
}

function addDemoBooking() {
  const clients = getClients();
  const client = clients[Math.floor(Math.random() * clients.length)];
  const barber = barbers[Math.floor(Math.random() * barbers.length)];
  const available = slots.find((slot) => !getBookings().some((booking) => booking.barberId === barber.id && booking.date === todayISO() && booking.time === slot && booking.status === "confirmed"));
  if (!client || !available) return;

  const service = services[Math.floor(Math.random() * services.length)];
  const booking = {
    id: crypto.randomUUID(),
    barberId: barber.id,
    serviceId: service.id,
    date: todayISO(),
    time: available,
    name: clientFullName(client),
    phone: client.phone,
    note: "Turno agregado desde panel.",
    paidAmount: service.price,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  saveBookings([...getBookings(), booking]);
  renderAuth();
  renderPanel();
  renderSlots();
}

async function copyClients() {
  const text = getClients()
    .map((client) => `${clientFullName(client)} - ${formatPhone(client.phone)}`)
    .join("\n");

  await navigator.clipboard.writeText(text);
  els.exportClients.textContent = "Copiado";
  window.setTimeout(() => {
    els.exportClients.textContent = "Copiar lista";
  }, 1400);
}

function generatePromo() {
  const promos = [
    "Hola! Soy de Lux. Esta semana tenemos horarios disponibles con Franco y Vito. Reservá desde Lux 3.0 y elegí tu barbero.",
    "Buenas! Pasó un tiempo desde tu último corte. Entrá a Lux 3.0, elegí Franco o Vito y reservá directo.",
    "Hola! Hoy abrimos nuevos turnos en Lux. Podés elegir barbero, servicio y horario desde la app.",
  ];
  els.promoText.value = promos[Math.floor(Math.random() * promos.length)];
  updatePromoLink();
}

function updatePromoLink() {
  els.promoWhatsapp.href = waLink("5491134567890", els.promoText.value);
}

function buildConfirmationMessage(booking) {
  const service = getService(booking.serviceId);
  const barber = getBarber(booking.barberId);
  return `Hola ${booking.name}! Tu turno en Lux queda confirmado para el ${formatDate(booking.date)} a las ${booking.time} con ${barber.name}. Servicio: ${service.name}. Valor: ${formatter.format(service.price)}. Podés cancelar o reprogramar hasta 1 hora antes entrando a Lux 3.0 con tu WhatsApp.`;
}

function buildReminderMessage(booking) {
  const service = getService(booking.serviceId);
  return `Hola ${booking.name}! Te recordamos tu turno en Lux: ${formatDate(booking.date)} a las ${booking.time} con ${getBarber(booking.barberId).name}. Servicio: ${service.name}. Te esperamos.`;
}

function setActiveClient(phone) {
  state.activePhone = normalizePhone(phone);
  localStorage.setItem(activeClientKey, state.activePhone);
  renderAuth();
}

function getActiveClient() {
  return getClient(state.activePhone);
}

function getClient(phone) {
  return getClients().find((client) => client.phone === normalizePhone(phone));
}

function getClients() {
  return state.clients;
}

function saveClients(clients) {
  const unique = new Map();
  clients.forEach((client) => {
    if (client.phone) unique.set(client.phone, client);
  });
  state.clients = Array.from(unique.values());
  localStorage.setItem(clientStoreKey, JSON.stringify(state.clients));
  pushClientsToCloud(state.clients);
}

function upsertClient(data) {
  const phone = normalizePhone(data.phone);
  if (!phone || !data.firstName || !data.lastName) return null;

  const clients = getClients();
  const existing = clients.find((client) => client.phone === phone);
  const client = {
    phone,
    firstName: data.firstName,
    lastName: data.lastName,
    notes: data.notes || existing?.notes || "",
    source: data.source || existing?.source || "client",
    createdAt: existing?.createdAt || todayISO(),
  };

  saveClients(existing ? clients.map((item) => (item.phone === phone ? client : item)) : [...clients, client]);
  return client;
}

function seedData() {
  if (!localStorage.getItem(clientStoreKey)) saveClients(defaultClients);
  if (!localStorage.getItem(bookingStoreKey)) saveBookings(defaultBookings);
}

function migrateBookings() {
  const bookings = getBookings();
  let changed = false;
  const migrated = bookings.map((booking, index) => {
    const barberId = booking.barberId || barbers[index % barbers.length].id;
    const paidAmount = booking.paidAmount || getService(booking.serviceId).price;
    const status = booking.status || "confirmed";
    if (barberId !== booking.barberId || paidAmount !== booking.paidAmount || status !== booking.status) changed = true;
    return { ...booking, barberId, paidAmount, status };
  });
  if (changed) saveBookings(migrated);
}

function getBookings() {
  return state.bookings;
}

function saveBookings(bookings) {
  state.bookings = bookings;
  localStorage.setItem(bookingStoreKey, JSON.stringify(bookings));
  pushBookingsToCloud(bookings);
}

function getService(id) {
  return services.find((service) => service.id === id) || services[0];
}

function getBarber(id) {
  return barbers.find((barber) => barber.id === id) || barbers[0];
}

function getBarberPasswords() {
  return JSON.parse(localStorage.getItem(barberPasswordStoreKey) || "{}");
}

function getBarberPassword(role) {
  return getBarberPasswords()[role] || "";
}

function saveBarberPassword(role, password) {
  const passwords = getBarberPasswords();
  passwords[role] = encodePassword(password);
  localStorage.setItem(barberPasswordStoreKey, JSON.stringify(passwords));
}

function matchesBarberPassword(role, password) {
  return getBarberPassword(role) === encodePassword(password);
}

function encodePassword(password) {
  return btoa(unescape(encodeURIComponent(password)));
}

function clientFullName(client) {
  return `${client.firstName} ${client.lastName}`.trim();
}

function canClientModify(booking) {
  return bookingDateTime(booking).getTime() - Date.now() > 60 * 60 * 1000;
}

function bookingDateTime(booking) {
  return new Date(`${booking.date}T${booking.time}:00`);
}

function getCurrentWeekDates() {
  const today = new Date(`${todayISO()}T12:00:00`);
  const day = today.getDay() || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - day + 1);

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      iso: toLocalISO(date),
      label: new Intl.DateTimeFormat("es-AR", { weekday: "short" }).format(date),
      short: new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(date),
    };
  });
}

function makeSeedBooking(id, barberId, serviceId, date, time, name, phone, note, status) {
  return {
    id,
    barberId,
    serviceId,
    date,
    time,
    name,
    phone,
    note,
    paidAmount: getService(serviceId).price,
    status,
    createdAt: new Date().toISOString(),
    completedAt: status === "completed" ? new Date().toISOString() : "",
  };
}

function waLink(phone, text) {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`;
}

function normalizePhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("549")) return digits;
  if (digits.startsWith("54")) return `549${digits.slice(2)}`;
  if (digits.startsWith("11")) return `549${digits}`;
  return digits;
}

function formatPhone(phone) {
  const normalized = normalizePhone(phone);
  return normalized.startsWith("549") ? normalized.replace(/^549/, "") : normalized;
}

function todayISO() {
  return toLocalISO(new Date());
}

function offsetDateISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toLocalISO(date);
}

function toLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
}

function installApp() {
  if (!state.deferredInstallPrompt) return;
  state.deferredInstallPrompt.prompt();
  state.deferredInstallPrompt = null;
  els.installButton.hidden = true;
}

function renderAll() {
  renderBarbers();
  renderServices();
  renderSlots();
  renderAuth();
  renderBarberSession();
  renderPanel();
  if (els.adminDialog.open) renderAdmin();
}

function hydrateCloudForm() {
  const config = getCloudConfig();
  els.cloudUrl.value = config.url || "";
  els.cloudKey.value = config.anonKey || "";
}

async function connectCloud(options = {}) {
  const config = getCloudConfig();

  if (options.replace) await disconnectCloud();
  if (!config.url || !config.anonKey) {
    setCloudStatus("Modo local", "Sin Supabase conectado. Los datos quedan solo en este dispositivo.");
    return;
  }

  if (!window.supabase?.createClient) {
    setCloudStatus("Sin conexión", "No pudimos cargar Supabase. Revisá internet y volvé a intentar.");
    return;
  }

  try {
    state.cloud.loading = true;
    setCloudStatus("Conectando", "Estamos trayendo la agenda compartida.");
    state.cloud.client = window.supabase.createClient(config.url, config.anonKey);
    state.cloud.enabled = true;
    await pullCloudData();
    startCloudRefresh();
    setCloudStatus("Nube activa", "Los turnos y clientes se sincronizan entre dispositivos.");
  } catch (error) {
    state.cloud.enabled = false;
    state.cloud.client = null;
    setCloudStatus("Error nube", "No pudimos conectar. Revisá que las tablas y claves de Supabase estén bien cargadas.");
    console.error(error);
  } finally {
    state.cloud.loading = false;
  }
}

async function disconnectCloud() {
  if (state.cloud.refreshTimer) window.clearInterval(state.cloud.refreshTimer);
  if (state.cloud.channel && state.cloud.client) await state.cloud.client.removeChannel(state.cloud.channel);
  state.cloud = {
    client: null,
    enabled: false,
    loading: false,
    channel: null,
    refreshTimer: null,
  };
  setCloudStatus("Modo local", "Los datos quedan solo en este dispositivo.");
}

function startCloudRefresh() {
  if (!state.cloud.client) return;
  if (state.cloud.refreshTimer) window.clearInterval(state.cloud.refreshTimer);
  state.cloud.refreshTimer = window.setInterval(() => {
    if (!state.cloud.loading) pullCloudData({ silent: true });
  }, 15000);

  state.cloud.channel = state.cloud.client
    .channel("lux-3-sync")
    .on("postgres_changes", { event: "*", schema: "public", table: "lux_clients" }, () => pullCloudData({ silent: true }))
    .on("postgres_changes", { event: "*", schema: "public", table: "lux_bookings" }, () => pullCloudData({ silent: true }))
    .subscribe();
}

async function pullCloudData(options = {}) {
  if (!state.cloud.client) return;
  if (!options.silent) setCloudStatus("Sincronizando", "Actualizando clientes y turnos.");

  const [clientsResult, bookingsResult] = await Promise.all([
    state.cloud.client.from("lux_clients").select("*").order("created_at", { ascending: true }),
    state.cloud.client.from("lux_bookings").select("*").order("date", { ascending: true }).order("time", { ascending: true }),
  ]);

  if (clientsResult.error) throw clientsResult.error;
  if (bookingsResult.error) throw bookingsResult.error;

  state.clients = (clientsResult.data || []).map(fromCloudClient);
  state.bookings = (bookingsResult.data || []).map(fromCloudBooking);
  localStorage.setItem(clientStoreKey, JSON.stringify(state.clients));
  localStorage.setItem(bookingStoreKey, JSON.stringify(state.bookings));
  renderAll();
  if (!options.silent) setCloudStatus("Nube activa", "Los turnos y clientes se sincronizan entre dispositivos.");
}

async function pushClientsToCloud(clients) {
  if (!state.cloud.enabled || !state.cloud.client) return;
  const payload = clients.map(toCloudClient);
  if (!payload.length) return;
  const { error } = await state.cloud.client.from("lux_clients").upsert(payload, { onConflict: "phone" });
  if (error) setCloudStatus("Error nube", "No pudimos guardar un cliente en Supabase.");
}

async function pushBookingsToCloud(bookings) {
  if (!state.cloud.enabled || !state.cloud.client) return;
  await pushClientsToCloud(state.clients);
  const payload = bookings.map(toCloudBooking);
  if (!payload.length) return;
  const { error } = await state.cloud.client.from("lux_bookings").upsert(payload, { onConflict: "id" });
  if (error) setCloudStatus("Error nube", "No pudimos guardar un turno en Supabase.");
}

function getCloudConfig() {
  const fileConfig = window.LUX_SUPABASE_CONFIG || {};
  if (fileConfig.url && fileConfig.anonKey) return fileConfig;

  try {
    return JSON.parse(localStorage.getItem(cloudConfigStoreKey) || "{}");
  } catch {
    return {};
  }
}

function setCloudStatus(label, help) {
  if (!els.cloudStatus || !els.cloudHelp) return;
  els.cloudStatus.textContent = label;
  els.cloudHelp.textContent = help;
}

function toCloudClient(client) {
  return {
    phone: client.phone,
    first_name: client.firstName,
    last_name: client.lastName,
    notes: client.notes || "",
    source: client.source || "client",
    created_at: client.createdAt || todayISO(),
  };
}

function fromCloudClient(client) {
  return {
    phone: client.phone,
    firstName: client.first_name || "",
    lastName: client.last_name || "",
    notes: client.notes || "",
    source: client.source || "client",
    createdAt: client.created_at || todayISO(),
  };
}

function toCloudBooking(booking) {
  return {
    id: booking.id,
    barber_id: booking.barberId,
    service_id: booking.serviceId,
    date: booking.date,
    time: booking.time,
    name: booking.name,
    phone: booking.phone,
    note: booking.note || "",
    paid_amount: booking.paidAmount || getService(booking.serviceId).price,
    status: booking.status || "confirmed",
    created_at: booking.createdAt || new Date().toISOString(),
    cancelled_at: booking.cancelledAt || null,
    completed_at: booking.completedAt || null,
  };
}

function fromCloudBooking(booking) {
  return {
    id: booking.id,
    barberId: booking.barber_id,
    serviceId: booking.service_id,
    date: booking.date,
    time: booking.time,
    name: booking.name,
    phone: booking.phone,
    note: booking.note || "",
    paidAmount: booking.paid_amount || getService(booking.service_id).price,
    status: booking.status || "confirmed",
    createdAt: booking.created_at || new Date().toISOString(),
    cancelledAt: booking.cancelled_at || "",
    completedAt: booking.completed_at || "",
  };
}

function readStoredList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}
