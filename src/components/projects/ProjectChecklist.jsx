import { Check, Pencil } from "lucide-react";
import { STAGE_STYLES } from "@/lib/taskConstants";
import { taskScheduleLabel, taskIsOverdue } from "@/lib/dates";
import { cn } from "@/lib/utils";

export default function ProjectChecklist({ tasks, today, onToggle, onEdit }) {
  const pending = tasks.filter((task) => task.stage !== "finalizado");
  const done = tasks.filter((task) => task.stage === "finalizado");

  if (tasks.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
        Este projeto ainda não tem tarefas no checklist.
      </p>
    );
  }

  const row = (task) => {
    const isDone = task.stage === "finalizado";
    const stage = STAGE_STYLES[task.stage] || STAGE_STYLES.para_iniciar;
    const overdue = taskIsOverdue(task, today);
    return (
      <li key={task.id} className="flex items-start gap-1 border-b border-border last:border-b-0">
        <button
          type="button"
          onClick={() => onToggle(task)}
          aria-label={isDone ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md transition hover:bg-secondary"
        >
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-[5px] border",
              isDone ? "agenda-task-checked" : "border-slate-300 bg-card dark:border-input"
            )}
          >
            {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
          </span>
        </button>

        <div className="min-w-0 flex-1 py-2.5">
          <p className={cn("text-sm font-medium text-foreground", isDone && "text-muted-foreground line-through")}>
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="agenda-stage-badge rounded-full px-2 py-0.5 font-medium" data-stage={stage.value}>
              {stage.label}
            </span>
            <span className={cn(overdue && "font-semibold agenda-overdue")}>{taskScheduleLabel(task)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label={`Editar ${task.title}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </li>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="meta-label mb-1">Pendentes · {pending.length}</p>
        {pending.length > 0 ? (
          <ul className="rounded-md border border-border bg-card">{pending.map(row)}</ul>
        ) : (
          <p className="rounded-md border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
            Nenhuma tarefa pendente.
          </p>
        )}
      </div>

      <div>
        <p className="meta-label mb-1">Concluídas · {done.length}</p>
        {done.length > 0 ? (
          <ul className="rounded-md border border-border bg-card">{done.map(row)}</ul>
        ) : (
          <p className="rounded-md border border-dashed border-border px-3 py-4 text-xs text-muted-foreground">
            Nenhuma tarefa concluída ainda.
          </p>
        )}
      </div>
    </div>
  );
}
