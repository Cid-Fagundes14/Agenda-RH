export const PRIORITIES = [
  { value: "baixa", label: "Baixa", color: "#64748B" },
  { value: "media", label: "Média", color: "#D97706" },
  { value: "alta", label: "Alta", color: "#DC2626" },
];

export const STAGES = [
  { value: "para_iniciar", label: "Para iniciar", color: "#64748B" },
  { value: "em_andamento", label: "Em andamento", color: "#2563EB" },
  { value: "finalizado", label: "Finalizado", color: "#059669" },
];

export const PRIORITY_STYLES = PRIORITIES.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});

export const STAGE_STYLES = STAGES.reduce((acc, item) => {
  acc[item.value] = item;
  return acc;
}, {});

export const PROJECT_COLORS = [
  "#2563EB",
  "#059669",
  "#D97706",
  "#DC2626",
  "#7C3AED",
  "#0891B2",
  "#DB2777",
  "#475569",
];

export const SCHEDULE_OPTIONS = [
  { value: "none", label: "Sem data" },
  { value: "day", label: "Um dia" },
  { value: "range", label: "Período" },
];

export function emptyTask(overrides = {}) {
  return {
    title: "",
    requester: "",
    notes: "",
    priority: "media",
    stage: "para_iniciar",
    project_id: "",
    schedule_type: "none",
    date: "",
    start_date: "",
    start_time: "",
    end_date: "",
    ...overrides,
  };
}
