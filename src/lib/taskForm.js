import { emptyTask } from "@/lib/taskConstants";

export function validateTaskForm(form) {
  if (!form.title || !form.title.trim()) return "Informe o título da tarefa.";
  if (form.schedule_type === "day" && !form.date) return "Informe a data da tarefa.";
  if (form.schedule_type === "range") {
    if (!form.start_date || !form.end_date) return "Informe a data de início e o prazo final.";
    if (form.end_date < form.start_date) {
      return "O prazo final deve ser igual ou posterior à data de início.";
    }
  }
  return "";
}

export function taskPayload(form) {
  return {
    title: form.title.trim(),
    requester: (form.requester || "").trim(),
    notes: form.notes || "",
    priority: form.priority || "media",
    stage: form.stage || "para_iniciar",
    project_id: form.project_id || "",
    schedule_type: form.schedule_type || "none",
    date: form.schedule_type === "day" ? form.date : "",
    start_date: form.schedule_type === "range" ? form.start_date : "",
    end_date: form.schedule_type === "range" ? form.end_date : "",
  };
}

export function normalizeDraftTask(form) {
  return emptyTask(taskPayload(form));
}
