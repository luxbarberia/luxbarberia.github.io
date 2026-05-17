const STORAGE_KEY = "saldodia-state-v1";

export const defaultCategories = [
  "Comida",
  "Supermercado",
  "Transporte",
  "Servicios",
  "Alquiler",
  "Tarjeta",
  "Salud",
  "Gimnasio",
  "Salidas",
  "Ropa",
  "Otros"
];

export const defaultPaymentMethods = ["Efectivo", "Debito", "Credito", "Transferencia", "Billetera"];

export const defaultState = {
  movements: [],
  settings: {
    currency: "ARS",
    monthlyBudget: 0,
    categories: defaultCategories,
    categoryBudgets: {},
    paymentMethods: defaultPaymentMethods,
    theme: "light"
  }
};

export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    const parsed = JSON.parse(raw);
    return normalizeState(parsed);
  } catch (error) {
    console.error("No se pudo cargar la informacion guardada", error);
    return structuredClone(defaultState);
  }
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
    return { ok: true };
  } catch (error) {
    console.error("No se pudo guardar la informacion", error);
    return { ok: false, error };
  }
};

export const resetState = () => {
  localStorage.removeItem(STORAGE_KEY);
  return structuredClone(defaultState);
};

export const normalizeState = (state) => {
  const settings = { ...defaultState.settings, ...(state?.settings || {}) };
  const categories = Array.from(new Set(settings.categories?.length ? settings.categories : defaultCategories));
  return {
    movements: Array.isArray(state?.movements) ? state.movements.map(normalizeMovement).filter(Boolean) : [],
    settings: {
      ...settings,
      categories,
      categoryBudgets: settings.categoryBudgets || {},
      paymentMethods: settings.paymentMethods?.length ? settings.paymentMethods : defaultPaymentMethods
    }
  };
};

export const normalizeMovement = (movement) => {
  if (!movement || !movement.id || !["expense", "income"].includes(movement.type)) return null;
  return {
    id: movement.id,
    type: movement.type,
    amount: Number(movement.amount) || 0,
    category: movement.category || "",
    description: movement.description || "",
    date: movement.date,
    paymentMethod: movement.paymentMethod || "",
    note: movement.note || "",
    recurring: {
      enabled: Boolean(movement.recurring?.enabled),
      frequency: movement.recurring?.frequency || "monthly",
      paused: Boolean(movement.recurring?.paused)
    },
    createdAt: movement.createdAt || new Date().toISOString(),
    updatedAt: movement.updatedAt || movement.createdAt || new Date().toISOString()
  };
};

export const exportJSON = (state) => {
  const blob = new Blob([JSON.stringify(normalizeState(state), null, 2)], { type: "application/json" });
  downloadBlob(blob, `saldodia-backup-${new Date().toISOString().slice(0, 10)}.json`);
};

export const exportCSV = (movements) => {
  const headers = ["id", "tipo", "monto", "categoria", "descripcion", "fecha", "medio", "recurrente", "frecuencia", "nota"];
  const rows = movements.map((item) => [
    item.id,
    item.type === "expense" ? "gasto" : "ingreso",
    item.amount,
    item.category || "",
    item.description || "",
    item.date,
    item.paymentMethod || "",
    item.recurring?.enabled ? "si" : "no",
    item.recurring?.frequency || "",
    item.note || ""
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, `saldodia-movimientos-${new Date().toISOString().slice(0, 10)}.csv`);
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
