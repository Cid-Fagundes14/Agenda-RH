import { useEffect, useState } from "react";
import { toast } from "sonner";
import { saveTask } from "@/api/agenda";
import AttachmentFields from "@/components/attachments/AttachmentFields";
import { useAttachmentDrafts } from "@/hooks/useAttachments";
import ResponsiveDialog from "@/components/ui-shared/ResponsiveDialog";
import TaskFormFields from "@/components/tasks/TaskFormFields";
import { taskStartTime } from "@/lib/dates";
import { emptyTask } from "@/lib/taskConstants";
import { taskPayload, validateTaskForm } from "@/lib/taskForm";

function taskToForm(task) {
  return emptyTask({ ...task, start_time: taskStartTime(task) });
}

export default function TaskFormDialog({ open, onOpenChange, projects = [], task = null, defaults = {}, onSaved }) {
  const [form, setForm] = useState(() => taskToForm(task || defaults));
  const [savedId, setSavedId] = useState(null);
  const { drafts: fileDrafts, setDrafts: setFileDrafts, upload } = useAttachmentDrafts("task");
  const parentId = task?.id || savedId;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(taskToForm(task || defaults));
      setSavedId(null);
      setFileDrafts([]);
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
      const saved = await saveTask(parentId, payload);
      setSavedId(saved.id);
      onSaved?.();
      const failures = await upload(saved.id);
      if (failures.length) {
        setError(`Tarefa salva. Tente enviar novamente: ${failures.join(", ")}.`);
        return;
      }
      toast.success(task ? "Tarefa atualizada." : "Tarefa criada.");
      onOpenChange(false);
    } catch {
      setError("Não foi possível concluir. Confira os dados e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        disabled={saving}
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
      onOpenChange={(value) => { if (!saving) onOpenChange(value); }}
      title={task ? "Editar tarefa" : "Nova tarefa"}
      description="O mesmo formulário vale para tarefas avulsas ou vinculadas a um projeto."
      footer={footer}
    >
      <TaskFormFields value={form} onChange={setForm} projects={projects} />
      {open ? <AttachmentFields kind="task" parentId={parentId} drafts={fileDrafts} setDrafts={setFileDrafts} disabled={saving} open={open} /> : null}
      {error ? (
        <p className="mt-4 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]">
          {error}
        </p>
      ) : null}
    </ResponsiveDialog>
  );
}
