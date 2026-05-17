export const todayISO = () => toISODate(new Date());

export const toISODate = (date) => {
  const value = new Date(date);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 10);
};

export const parseLocalDate = (isoDate) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const formatDate = (isoDate) => {
  if (!isoDate) return "";
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(
    parseLocalDate(isoDate)
  );
};

export const isSameDay = (isoDate, reference = new Date()) => isoDate === toISODate(reference);

export const startOfWeek = (date = new Date()) => {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
};

export const endOfWeek = (date = new Date()) => {
  const result = startOfWeek(date);
  result.setDate(result.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
};

export const startOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);

export const endOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export const daysInCurrentMonth = (date = new Date()) => endOfMonth(date).getDate();

export const daysRemainingInMonth = (date = new Date()) => {
  const total = daysInCurrentMonth(date);
  return Math.max(total - date.getDate(), 0);
};

export const isInRange = (isoDate, from, to) => {
  const value = parseLocalDate(isoDate).getTime();
  return value >= parseLocalDate(from).getTime() && value <= parseLocalDate(to).getTime();
};

export const isThisWeek = (isoDate, reference = new Date()) => {
  const value = parseLocalDate(isoDate).getTime();
  return value >= startOfWeek(reference).getTime() && value <= endOfWeek(reference).getTime();
};

export const isThisMonth = (isoDate, reference = new Date()) => {
  const value = parseLocalDate(isoDate);
  return value.getFullYear() === reference.getFullYear() && value.getMonth() === reference.getMonth();
};

export const getMonthDaysUntilToday = (date = new Date()) => {
  const days = [];
  for (let day = 1; day <= date.getDate(); day += 1) {
    days.push(toISODate(new Date(date.getFullYear(), date.getMonth(), day)));
  }
  return days;
};

export const getCurrentMonthRange = (date = new Date()) => ({
  from: toISODate(startOfMonth(date)),
  to: toISODate(endOfMonth(date))
});
