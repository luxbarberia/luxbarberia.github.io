const SESSION_KEY = "findemes-cloud-session-v1";

export const CLOUD_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: ""
};

export const isCloudConfigured = () =>
  Boolean(CLOUD_CONFIG.supabaseUrl && CLOUD_CONFIG.supabaseAnonKey);

const anonKey = () => CLOUD_CONFIG.supabaseAnonKey || "";

const authHeaders = (token) => ({
  apikey: anonKey(),
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

export const normalizeLogin = (value) => {
  const clean = String(value || "").trim().toLowerCase();
  if (clean.includes("@")) return clean;
  return `${clean.replace(/[^a-z0-9._-]/g, "")}@findemes.local`;
};

export const loadCloudSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveCloudSession = (session) => {
  if (!session) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const cloudSignUp = async ({ login, password }) => {
  ensureConfigured();
  const email = normalizeLogin(login);
  const response = await fetch(`${CLOUD_CONFIG.supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password })
  });
  return parseAuthResponse(response, email);
};

export const cloudSignIn = async ({ login, password }) => {
  ensureConfigured();
  const email = normalizeLogin(login);
  const response = await fetch(`${CLOUD_CONFIG.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password })
  });
  return parseAuthResponse(response, email);
};

export const cloudSignOut = () => saveCloudSession(null);

export const fetchRemoteState = async (session) => {
  ensureConfigured();
  const response = await fetch(
    `${CLOUD_CONFIG.supabaseUrl}/rest/v1/user_states?user_id=eq.${session.user.id}&select=data,updated_at&limit=1`,
    { headers: authHeaders(session.access_token) }
  );
  if (!response.ok) throw new Error(await safeError(response, "No se pudo leer la nube"));
  const rows = await response.json();
  return rows[0]?.data || null;
};

export const saveRemoteState = async (session, state) => {
  ensureConfigured();
  const response = await fetch(`${CLOUD_CONFIG.supabaseUrl}/rest/v1/user_states`, {
    method: "POST",
    headers: {
      ...authHeaders(session.access_token),
      Prefer: "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify({
      user_id: session.user.id,
      data: state,
      updated_at: new Date().toISOString()
    })
  });
  if (!response.ok) throw new Error(await safeError(response, "No se pudo sincronizar"));
};

const parseAuthResponse = async (response, email) => {
  if (!response.ok) throw new Error(await safeError(response, "No se pudo iniciar sesion"));
  const payload = await response.json();
  const session = {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    user: payload.user,
    email,
    created_at: new Date().toISOString()
  };
  if (!session.access_token || !session.user?.id) {
    throw new Error("La cuenta se creo, pero falta confirmar el email o activar el inicio directo.");
  }
  saveCloudSession(session);
  return session;
};

const safeError = async (response, fallback) => {
  try {
    const data = await response.json();
    return data.msg || data.message || data.error_description || fallback;
  } catch {
    return fallback;
  }
};

const ensureConfigured = () => {
  if (!isCloudConfigured()) {
    throw new Error("Falta configurar Supabase para activar la sincronizacion.");
  }
};
