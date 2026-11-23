import { useEffect, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import ResponsiveDialog from "@/components/ui-shared/ResponsiveDialog";
import TaskFormFields from "@/components/tasks/TaskFormFields";
import { emptyTask } from "@/lib/taskConstants";
import { taskPayload, validateTaskForm } from "@/lib/taskForm";

export default function TaskFormDialog({ open, onOpenChange, projects = [], task = null, defaults = {}, onSaved }) {
  const [form, setForm] = useState(() => emptyTask(task || defaults));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(emptyTask(task || defaults));
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task?.id]);

  const submit = async () => {
    const validation = validateTaskForm(form);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = taskPayload(form);
      if (task) {
        await base44.entities.Task.update(task.id, payload);
        toast.success("Tarefa atualizada.");
      } else {
        await base44.entities.Task.create(payload);
        toast.success("Tarefa criada.");
      }
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      setError("Não foi possível salvar a tarefa. Seus dados foram mantidos, tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="min-h-11 rounded-md border border-border px-4 text-sm font-medium text-foreground transition hover:bg-secondary"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={submit}
        disabled={saving}
        className="min-h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-[#1D4ED8] disabled:opacity-60"
      >
        {saving ? "Salvando..." : task ? "Salvar alterações" : "Criar tarefa"}
      </button>
    </div>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={task ? "Editar tarefa" : "Nova tarefa"}
      description="O mesmo formulário vale para tarefas avulsas ou vinculadas a um projeto."
      footer={footer}
    >
      <TaskFormFields value={form} onChange={setForm} projects={projects} />
      {error ? (
        <p className="mt-4 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]">
          {error}
        </p>
      ) : null}
    </ResponsiveDialog>
  );
}
