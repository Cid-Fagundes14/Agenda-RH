import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProject } from "@/api/agenda";
import AttachmentList from "@/components/attachments/AttachmentList";
import { useAttachments } from "@/hooks/useAttachments";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ProjectChecklist from "@/components/projects/ProjectChecklist";
import ProjectFormDialog from "@/components/projects/ProjectFormDialog";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import { useAgendaData } from "@/hooks/useAgendaData";
import { projectEventLabel, todayISO } from "@/lib/dates";

export const Route = createFileRoute("/_authed/projetos/$projectId")({
  head: () => ({ meta: [{ title: "Projeto · Agenda de RH" }] }),
  component: ProjetoDetalhePage,
});

function ProjetoDetalhePage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const today = todayISO();
  const { tasks, projects, loading, error, refresh, toggleTask } = useAgendaData();
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTasks, setDeleteTasks] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const project = projects.find((item) => item.id === projectId);
  const attachments = useAttachments("project", project?.id);
  const projectTasks = useMemo(
    () => tasks.filter((task) => task.project_id === projectId),
    [tasks, projectId]
  );
  const doneCount = projectTasks.filter((task) => task.stage === "finalizado").length;
  const percent = projectTasks.length === 0 ? 0 : Math.round((doneCount / projectTasks.length) * 100);

  async function removeProject() {
    setDeleting(true);
    try {
      await deleteProject(project.id, deleteTasks ? projectTasks.map(({ id }) => id) : null);
      toast.success("Evento excluído.");
      setConfirmDelete(false);
      await refresh();
      await navigate({ to: "/projetos" });
    } catch (failure) {
      toast.error(failure instanceof Error ? failure.message : "Não foi possível concluir a exclusão. Confira os anexos restantes e tente novamente.");
      await Promise.all([attachments.refetch(), refresh()]);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando projeto...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card-surface p-6">
        <p className="font-heading text-base font-semibold text-foreground">
          {error ? "Não foi possível carregar o projeto." : "Projeto não encontrado."}
        </p>
        <Link to="/projetos" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium agenda-link">
          <ArrowLeft className="h-4 w-4" />
          Voltar para projetos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/projetos"
        className="mb-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Projetos
      </Link>

      <div className="card-surface overflow-hidden">
        <div className="h-1.5 w-full" style={{ backgroundColor: project.color }} />
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="meta-label">Evento · {projectEventLabel(project)}</p>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {project.name}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setProjectFormOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:bg-secondary"
              >
                <Pencil className="h-4 w-4" />
                Editar projeto
              </button>
              <button
                type="button"
                disabled={!attachments.data || attachments.isError || deleting}
                onClick={() => { setDeleteTasks(false); setConfirmDelete(true); }}
                className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-medium agenda-danger-text hover:bg-secondary disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Excluir evento
              </button>
            </div>
          </div>

          {project.notes ? (
            <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{project.notes}</p>
          ) : null}

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                {doneCount} de {projectTasks.length} concluídas
              </span>
              <span className="text-muted-foreground">{percent}%</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: project.color }} />
            </div>
          </div>
        </div>
      </div>

      <section className="card-surface mt-4 space-y-2 p-4">
        <h2 className="font-heading text-lg font-semibold">Anexos do evento</h2>
        <AttachmentList query={attachments} disabled={deleting} />
      </section>

      <div className="mt-6 flex items-center justify-between gap-2">
        <h2 className="font-heading text-[1.25rem] font-semibold tracking-tight text-foreground">Checklist</h2>
        <button
          type="button"
          onClick={() => {
            setEditingTask(null);
            setTaskFormOpen(true);
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[var(--agenda-button-hover)]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Adicionar tarefa
        </button>
      </div>

      <div className="mt-3">
        <ProjectChecklist
          tasks={projectTasks}
          today={today}
          onToggle={toggleTask}
          onEdit={(task) => {
            setEditingTask(task);
            setTaskFormOpen(true);
          }}
        />
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={(open) => { if (!deleting) setConfirmDelete(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este evento?</AlertDialogTitle>
            <AlertDialogDescription>
              “{project.name}” será excluído permanentemente.
              {attachments.data?.length ? ` Anexos do evento a excluir: ${attachments.data.length}.` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {projectTasks.length ? (
            <div className="space-y-2">
              <label className="flex cursor-pointer items-start gap-2 rounded-md border p-3 text-sm font-medium">
                <input type="checkbox" checked={deleteTasks} disabled={deleting}
                  onChange={(event) => setDeleteTasks(event.target.checked)} className="mt-0.5 size-4 shrink-0 accent-primary" />
                <span>Excluir também as tarefas vinculadas e seus anexos ({projectTasks.length})</span>
              </label>
              {deleteTasks ? (
                <p className="px-1 text-xs agenda-danger-text">As tarefas selecionadas e seus anexos serão apagados permanentemente.</p>
              ) : (
                <p className="px-1 text-xs text-muted-foreground">As tarefas vinculadas passarão a ser avulsas e manterão seus anexos.</p>
              )}
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive hover:brightness-90"
              onClick={(event) => { event.preventDefault(); removeProject(); }}>
              {deleting ? "Excluindo..." : "Excluir evento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ProjectFormDialog
        open={projectFormOpen}
        onOpenChange={setProjectFormOpen}
        project={project}
        onSaved={refresh}
      />

      <TaskFormDialog
        open={taskFormOpen}
        onOpenChange={setTaskFormOpen}
        projects={projects}
        task={editingTask}
        defaults={{ project_id: project.id }}
        onSaved={refresh}
      />
    </div>
  );
}
