import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban, Loader2, Plus } from "lucide-react";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectFormDialog from "@/components/projects/ProjectFormDialog";
import { useAgendaData } from "@/hooks/useAgendaData";

export const Route = createFileRoute("/_authed/projetos/")({
  head: () => ({ meta: [{ title: "Projetos · Agenda de RH" }] }),
  component: ProjetosPage,
});

function ProjetosPage() {
  const { tasks, projects, loading, error, refresh } = useAgendaData();
  const [formOpen, setFormOpen] = useState(false);

  const progress = useMemo(() => {
    const map = {};
    projects.forEach((project) => {
      const items = tasks.filter((task) => task.project_id === project.id);
      map[project.id] = {
        total: items.length,
        done: items.filter((task) => task.stage === "finalizado").length,
      };
    });
    return map;
  }, [tasks, projects]);

  return (
    <div>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="meta-label">Treinamentos e ações</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-[2.25rem] sm:leading-tight">
            Projetos
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[#1D4ED8]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Novo projeto</span>
        </button>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando projetos...
        </div>
      ) : error ? (
        <div className="card-surface p-5">
          <p className="text-sm font-medium">Não foi possível carregar os projetos.</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Tentar novamente
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="card-surface agenda-panel flex flex-col items-center gap-3 px-6 py-14 text-center">
          <FolderKanban className="h-8 w-8 text-muted-foreground" />
          <p className="font-heading text-base font-semibold text-foreground">Nenhum projeto ainda</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Crie um projeto para agrupar o checklist de um treinamento ou ação de desenvolvimento.
          </p>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="mt-1 min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Novo projeto
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              doneCount={progress[project.id]?.done ?? 0}
              totalCount={progress[project.id]?.total ?? 0}
            />
          ))}
        </div>
      )}

      <ProjectFormDialog open={formOpen} onOpenChange={setFormOpen} onSaved={refresh} />
    </div>
  );
}
