import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { projectEventLabel } from "@/lib/dates";

export default function ProjectCard({ project, doneCount, totalCount }) {
  const percent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  return (
    <Link
      to="/projetos/$projectId"
      params={{ projectId: project.id }}
      className="card-surface agenda-panel block border-l-4 p-4 transition hover:border-slate-400 dark:hover:border-input"
      style={{ borderLeftColor: project.color }}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-semibold text-foreground">{project.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{projectEventLabel(project)}</p>
        </div>
        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">
            {doneCount} de {totalCount} concluídas
          </span>
          <span className="text-muted-foreground">{percent}%</span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-secondary">
          <div
            className="h-full rounded-full"
            style={{ width: `${percent}%`, backgroundColor: project.color }}
          />
        </div>
      </div>
    </Link>
  );
}
