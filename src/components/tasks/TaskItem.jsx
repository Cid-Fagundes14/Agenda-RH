import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIORITY_STYLES, STAGE_STYLES } from "@/lib/taskConstants";
import { taskDateLabel, taskStartTime } from "@/lib/dates";

export default function TaskItem({ task, project, overdue = false, onToggle, onOpen }) {
  const time = taskStartTime(task);
  const done = task.stage === "finalizado";
  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.media;
  const stage = STAGE_STYLES[task.stage] || STAGE_STYLES.para_iniciar;

  return (
    <div
      className={cn(
        "card-surface agenda-panel flex items-start gap-2 p-3 transition hover:border-slate-400 dark:hover:border-input",
        overdue && "agenda-overdue-item",
        done && "opacity-80"
      )}
    >
      <button
        type="button"
        onClick={() => onToggle?.(task)}
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

      <button
        type="button"
        onClick={() => onOpen?.(task)}
        className="min-w-0 flex-1 py-1 text-left"
      >
        <div className="flex items-center gap-2">
          {time ? (
            <time className="shrink-0 rounded-md bg-card px-2 py-0.5 text-xs font-semibold tabular-nums text-sidebar-primary">
              {time}
            </time>
          ) : null}
          <p
            className={cn(
              "truncate text-sm font-medium text-foreground",
              done && "line-through decoration-slate-400 text-muted-foreground"
            )}
          >
            {task.title}
          </p>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: priority.color }} />
            {priority.label}
          </span>
          <span className="text-slate-300 dark:text-muted-foreground">·</span>
          <span className={cn(overdue && "font-semibold agenda-overdue")}>{taskDateLabel(task)}</span>
          {project ? (
            <>
              <span className="text-slate-300 dark:text-muted-foreground">·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="max-w-[180px] truncate">{project.name}</span>
              </span>
            </>
          ) : (
            <>
              <span className="text-slate-300 dark:text-muted-foreground">·</span>
              <span>Avulsa</span>
            </>
          )}
          <span
            className="agenda-stage-badge rounded-full px-2 py-0.5 text-[11px] font-medium"
            data-stage={stage.value}
          >
            {stage.label}
          </span>
        </div>
      </button>
    </div>
  );
}
