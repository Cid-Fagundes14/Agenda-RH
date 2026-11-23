import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import { createProjectWithTasks } from "@/lib/server-fns";
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
  const createProject = useServerFn(createProjectWithTasks);
  const [form, setForm] = useState(() => initialProject(project));
  const [drafts, setDrafts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(initialProject(project));
      setDrafts([]);
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
      if (project) {
        await base44.entities.Project.update(project.id, payload);
        toast.success("Projeto atualizado.");
      } else {
        await createProject({ data: { project: payload, tasks: drafts } });
        toast.success("Projeto e checklist salvos.");
      }
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      setError("Não foi possível salvar o projeto. Seus dados foram mantidos, tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={() => onOpenChange(false)}
        className="min-h-11 rounded-md border border-border px-4 text-sm font-medium transition hover:bg-secondary"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={submit}
        disabled={saving}
        className="min-h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-[#1D4ED8] disabled:opacity-60"
      >
        {saving ? "Salvando..." : project ? "Salvar projeto" : "Criar projeto"}
      </button>
    </div>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={project ? "Editar projeto" : "Novo projeto"}
      description="Projeto e evento são o mesmo registro: com data, ele aparece no calendário."
      footer={footer}
    >
      <ProjectFormFields value={form} onChange={setForm} />
      {!project ? (
        <div className="mt-5 border-t border-border pt-4">
          <ProjectTaskDrafts drafts={drafts} onChange={setDrafts} />
        </div>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C]">
          {error}
        </p>
      ) : null}
    </ResponsiveDialog>
  );
}
