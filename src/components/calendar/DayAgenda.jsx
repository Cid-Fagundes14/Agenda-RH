import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PRIORITY_STYLES, STAGE_STYLES } from "@/lib/taskConstants";
import { compareTaskStartTime, longDate, projectOccursOn, taskDueDate, taskOccursOn, taskStartTime } from "@/lib/dates";
import { cn } from "@/lib/utils";

export default function DayAgenda({ date, tasks, projects, onToggleTask, onOpenTask }) {
  const events = projects.filter((project) => projectOccursOn(project, date));
  const dayTasks = tasks
    .filter((task) => taskOccursOn(task, date))
    .sort((a, b) => compareTaskStartTime(a, b) || Number(a.stage === "finalizado") - Number(b.stage === "finalizado"));

  return (
    <div className="card-surface p-4">
      <h2 className="font-heading text-base font-semibold text-foreground">{longDate(date)}</h2>

      <div className="mt-4">
        <p className="meta-label mb-2">Eventos · {events.length}</p>
        {events.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhum evento neste dia.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((project) => (
              <li key={project.id}>
                <Link
                  to="/projetos/$projectId"
                  params={{ projectId: project.id }}
                  className="flex min-h-11 items-center gap-2 rounded-md px-2 py-2 transition hover:bg-secondary"
                  style={{ borderLeft: `4px solid ${project.color}` }}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
                  <span className="truncate text-sm font-medium text-foreground">{project.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-5">
        <p className="meta-label mb-2">Tarefas · {dayTasks.length}</p>
        {dayTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhuma tarefa agendada para este dia.</p>
        ) : (
          <ul className="space-y-2">
            {dayTasks.map((task) => {
              const done = task.stage === "finalizado";
              const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.media;
              const stage = STAGE_STYLES[task.stage] || STAGE_STYLES.para_iniciar;
              const time = taskStartTime(task);
              const isDue = taskDueDate(task) === date;
              return (
                <li key={task.id} className="flex items-start gap-1 rounded-md border border-border">
                  <button
                    type="button"
                    onClick={() => onToggleTask(task)}
                    aria-label={done ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition hover:bg-secondary"
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-[5px] border",
                        done ? "agenda-task-checked" : "border-slate-300 bg-card dark:border-input"
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                    </span>
                  </button>
                  <button type="button" onClick={() => onOpenTask(task)} className="min-w-0 flex-1 py-2 text-left">
                    <p className={cn("text-sm font-medium text-foreground", done && "text-muted-foreground line-through")}>
                      {task.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                      {time ? <time className="font-semibold text-foreground">{time}</time> : null}
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: priority.color }} />
                        {priority.label}
                      </span>
                      <span className="agenda-stage-badge rounded-full px-1.5 py-0.5 font-medium" data-stage={stage.value}>
                        {stage.label}
                      </span>
                      {isDue ? (
                        <span className="agenda-danger-surface rounded-full px-1.5 py-0.5 font-semibold">
                          Prazo final
                        </span>
                      ) : null}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
