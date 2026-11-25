import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createProjectWithTasks, updateProject } from "@/api/agenda";
import AttachmentFields from "@/components/attachments/AttachmentFields";
import { useAttachmentDrafts } from "@/hooks/useAttachments";
import ResponsiveDialog from "@/components/ui-shared/ResponsiveDialog";
import ProjectFormFields from "@/components/projects/ProjectFormFields";
import ProjectTaskDrafts from "@/components/projects/ProjectTaskDrafts";
import { PROJECT_COLORS } from "@/lib/taskConstants";

function initialProject(project) {
  return {
    name: project?.name || "",
    notes: project?.notes || "",
    color: project?.color || PROJECT_COLORS[0],
    event_type: project?.event_type || "none",
    event_date: project?.event_date || "",
    event_start: project?.event_start || "",
    event_end: project?.event_end || "",
  };
}

export default function ProjectFormDialog({ open, onOpenChange, project = null, onSaved }) {
  const [form, setForm] = useState(() => initialProject(project));
  const [drafts, setDrafts] = useState([]);
  const [savedId, setSavedId] = useState(null);
  const { drafts: fileDrafts, setDrafts: setFileDrafts, upload } = useAttachmentDrafts("project");
  const parentId = project?.id || savedId;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initialProject(project));
      setDrafts([]);
      setSavedId(null);
      setFileDrafts([]);
      setError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project?.id]);

  const submit = async () => {
    if (!form.name.trim()) {
      setError("Informe o nome do projeto.");
      return;
    }
    if (form.event_type === "day" && !form.event_date) {
      setError("Informe a data do evento.");
      return;
    }
    if (form.event_type === "range") {
      if (!form.event_start || !form.event_end) {
        setError("Informe o início e o fim do evento.");
        return;
      }
      if (form.event_end < form.event_start) {
        setError("O fim do evento deve ser igual ou posterior ao início.");
        return;
      }
    }

    const payload = {
      name: form.name.trim(),
      notes: form.notes || "",
      color: form.color,
      event_type: form.event_type,
      event_date: form.event_type === "day" ? form.event_date : "",
      event_start: form.event_type === "range" ? form.event_start : "",
      event_end: form.event_type === "range" ? form.event_end : "",
    };

    setSaving(true);
    setError("");
    try {
      const saved = parentId
        ? await updateProject(parentId, payload)
        : await createProjectWithTasks(payload, drafts);
      setSavedId(saved.id);
      onSaved?.();
      const failures = await upload(saved.id);
      if (failures.length) {
        setError(`Projeto salvo. Tente enviar novamente: ${failures.join(", ")}.`);
        return;
      }
      toast.success(project ? "Projeto atualizado." : "Projeto e checklist salvos.");
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
        className="min-h-11 rounded-md border border-border px-4 text-sm font-medium transition hover:bg-secondary"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={submit}
        disabled={saving}
        className="min-h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-[var(--agenda-button-hover)] disabled:opacity-60"
      >
        {saving ? "Salvando..." : project ? "Salvar projeto" : "Criar projeto"}
      </button>
    </div>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(value) => { if (!saving) onOpenChange(value); }}
      title={project ? "Editar projeto" : "Novo projeto"}
      description="Projeto e evento são o mesmo registro: com data, ele aparece no calendário."
      footer={footer}
    >
      <ProjectFormFields value={form} onChange={setForm} />
      {!parentId ? (
        <div className="mt-5 border-t border-border pt-4">
          <ProjectTaskDrafts drafts={drafts} onChange={setDrafts} />
        </div>
      ) : null}
      {open ? <AttachmentFields kind="project" parentId={parentId} drafts={fileDrafts} setDrafts={setFileDrafts} disabled={saving} open={open} /> : null}
      {error ? (
        <p className="mt-4 rounded-md border agenda-danger-surface px-3 py-2 text-xs font-medium">
          {error}
        </p>
      ) : null}
    </ResponsiveDialog>
  );
}
