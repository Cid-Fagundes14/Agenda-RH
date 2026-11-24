// Regras centrais de datas da Agenda de RH.
// Todas as datas de calendário são strings "YYYY-MM-DD", sem horário, para
// nunca mudarem de dia por conversão de fuso.

export const APP_TIMEZONE = "America/Sao_Paulo";

export function todayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function fromISO(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(iso, amount) {
  const date = fromISO(iso);
  date.setDate(date.getDate() + amount);
  return toISO(date);
}

export function formatBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function formatBRShort(iso) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function longDate(iso) {
  if (!iso) return "";
  const text = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(fromISO(iso));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function monthTitle(year, month) {
  const text = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(
    new Date(year, month, 1, 12)
  );
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatPeriod(start, end) {
  if (!start) return "";
  if (!end || start === end) return formatBR(start);
  return `${formatBR(start)} a ${formatBR(end)}`;
}

// ---- Tarefas ----

export function taskRange(task) {
  if (!task) return null;
  if (task.schedule_type === "day" && task.date) {
    return { start: task.date, end: task.date };
  }
  if (task.schedule_type === "range" && task.start_date) {
    const end = task.end_date && task.end_date >= task.start_date ? task.end_date : task.start_date;
    return { start: task.start_date, end };
  }
  return null;
}

export function taskDueDate(task) {
  const range = taskRange(task);
  return range ? range.end : null;
}

export function isTaskOpen(task) {
  return !!task && task.stage !== "finalizado";
}

export function taskOccursOn(task, iso) {
  const range = taskRange(task);
  return !!range && iso >= range.start && iso <= range.end;
}

export function taskIsOverdue(task, today) {
  const due = taskDueDate(task);
  return !!due && isTaskOpen(task) && due < today;
}

export function taskStartTime(task) {
  return task.start_time?.slice(0, 5) || "";
}

export function compareTaskStartTime(a, b) {
  return (taskStartTime(a) || "24:00").localeCompare(taskStartTime(b) || "24:00");
}

export function taskDateLabel(task) {
  const range = taskRange(task);
  if (!range) return "Sem data";
  return range.start === range.end
    ? formatBR(range.end)
    : `${formatBRShort(range.start)} a ${formatBR(range.end)}`;
}

export function taskScheduleLabel(task) {
  const date = taskDateLabel(task);
  const time = taskStartTime(task);
  return time ? `${date} · ${time}` : date;
}

// ---- Projetos / eventos ----

export function projectRange(project) {
  if (!project) return null;
  if (project.event_type === "day" && project.event_date) {
    return { start: project.event_date, end: project.event_date };
  }
  if (project.event_type === "range" && project.event_start) {
    const end =
      project.event_end && project.event_end >= project.event_start ? project.event_end : project.event_start;
    return { start: project.event_start, end };
  }
  return null;
}

export function projectOccursOn(project, iso) {
  const range = projectRange(project);
  return !!range && iso >= range.start && iso <= range.end;
}

export function projectEventLabel(project) {
  const range = projectRange(project);
  if (!range) return "Sem data";
  return formatPeriod(range.start, range.end);
}

// ---- Calendário ----

export function monthGrid(year, month) {
  const first = new Date(year, month, 1, 12);
  const weekday = (first.getDay() + 6) % 7; // segunda = 0
  const start = addDays(toISO(first), -weekday);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function daysInRange(start, end) {
  const days = [];
  let cursor = start;
  let guard = 0;
  while (cursor <= end && guard < 400) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
  return days;
}
