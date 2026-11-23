import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import TaskFormFields from "@/components/tasks/TaskFormFields";
import { emptyTask, PRIORITY_STYLES } from "@/lib/taskConstants";
import { normalizeDraftTask, validateTaskForm } from "@/lib/taskForm";
import { taskDueLabel } from "@/lib/dates";

export default function ProjectTaskDrafts({ drafts, onChange }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [draft, setDraft] = useState(emptyTask());
  const [error, setError] = useState("");

  const startAdd = () => {
    setDraft(emptyTask());
    setEditingIndex(null);
    setError("");
    setEditorOpen(true);
  };

  const startEdit = (index) => {
    setDraft(emptyTask(drafts[index]));
    setEditingIndex(index);
    setError("");
    setEditorOpen(true);
  };

  const commit = () => {
    const validation = validateTaskForm(draft);
    if (validation) {
      setError(validation);
      return;
    }
    const next = [...drafts];
    const normalized = normalizeDraftTask(draft);
    if (editingIndex === null) next.push(normalized);
    else next[editingIndex] = normalized;
    onChange(next);
    setEditorOpen(false);
    setEditingIndex(null);
    setError("");
  };

  const remove = (index) => onChange(drafts.filter((_, i) => i !== index));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="meta-label">Checklist do projeto</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {drafts.length === 0 ? "Nenhuma tarefa adicionada ainda." : `${drafts.length} tarefa(s) prontas para salvar.`}
          </p>
        </div>
        <button
          type="button"
          onClick={startAdd}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground transition hover:bg-secondary"
        >
          <Plus className="h-4 w-4" />
          Adicionar tarefa
        </button>
      </div>

      {drafts.length > 0 ? (
        <ul className="space-y-2">
          {drafts.map((task, index) => {
            const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.media;
            return (
              <li
                key={`${task.title}-${index}`}
                className="flex items-start gap-2 rounded-md border border-border bg-secondary/50 p-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{task.title}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: priority.color }} />
                    {priority.label} · {taskDueLabel(task)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(index)}
                  aria-label={`Editar ${task.title}`}
                  className="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition hover:bg-white hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remover ${task.title}`}
                  className="flex h-11 w-11 items-center justify-center rounded-md text-[#B91C1C] transition hover:bg-[#FEF2F2]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {editorOpen ? (
        <div className="rounded-md border border-border bg-white p-3">
          <p className="mb-3 text-sm font-semibold text-foreground">
            {editingIndex === null ? "Nova tarefa do checklist" : "Editar tarefa do checklist"}
          </p>
          <TaskFormFields value={draft} onChange={setDraft} hideProject />
          {error ? <p className="mt-3 text-xs font-medium text-[#B91C1C]">{error}</p> : null}
          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className="min-h-11 rounded-md border border-border px-4 text-sm font-medium transition hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={commit}
              className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[#1D4ED8]"
            >
              {editingIndex === null ? "Adicionar ao checklist" : "Salvar tarefa"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
