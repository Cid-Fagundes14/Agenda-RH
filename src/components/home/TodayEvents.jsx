import { Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { projectEventLabel } from "@/lib/dates";

export default function TodayEvents({ projects }) {
  return (
    <aside className="lg:sticky lg:top-5">
      <div className="mb-2 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-heading text-[1.25rem] font-semibold tracking-tight text-foreground">
          Eventos de hoje
        </h2>
      </div>

      {projects.length === 0 ? (
        <div className="card-surface agenda-panel p-4 text-sm text-muted-foreground">
          Nenhum evento do seu time hoje.
        </div>
      ) : (
        <>
          {/* Mobile: chips em rolagem horizontal */}
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
            {projects.map((project) => (
              <Link
                key={project.id}
                to="/projetos/$projectId"
                params={{ projectId: project.id }}
                className="agenda-panel flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium text-foreground"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="max-w-[220px] truncate">{project.name}</span>
              </Link>
            ))}
          </div>

          <div className="hidden space-y-2 lg:block">
            {projects.map((project) => (
              <Link
                key={project.id}
                to="/projetos/$projectId"
                params={{ projectId: project.id }}
                className="card-surface agenda-panel block p-3 transition hover:border-slate-300"
                style={{ borderLeft: `4px solid ${project.color}` }}
              >
                <p className="text-sm font-semibold text-foreground">{project.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{projectEventLabel(project)}</p>
              </Link>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
