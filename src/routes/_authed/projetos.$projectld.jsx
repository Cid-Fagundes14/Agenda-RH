import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Pencil, Plus } from "lucide-react";
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
  const today = todayISO();
  const { tasks, projects, loading, error, refresh, toggleTask } = useAgendaData();
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const project = projects.find((item) => item.id === projectId);
  const projectTasks = useMemo(
    () => tasks.filter((task) => task.project_id === projectId),
    [tasks, projectId]
  );
  const doneCount = projectTasks.filter((task) => task.stage === "finalizado").length;
  const percent = projectTasks.length === 0 ? 0 : Math.round((doneCount / projectTasks.length) * 100);

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
        <Link to="/projetos" className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary">
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
            <button
              type="button"
              onClick={() => setProjectFormOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium transition hover:bg-secondary"
            >
              <Pencil className="h-4 w-4" />
              Editar projeto
            </button>
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

      <div className="mt-6 flex items-center justify-between gap-2">
        <h2 className="font-heading text-[1.25rem] font-semibold tracking-tight text-foreground">Checklist</h2>
        <button
          type="button"
          onClick={() => {
            setEditingTask(null);
            setTaskFormOpen(true);
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[#1D4ED8]"
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
