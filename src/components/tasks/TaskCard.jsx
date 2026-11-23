import { PRIORITY_STYLES, STAGE_STYLES } from "@/lib/taskConstants";
import { taskDueLabel, taskIsOverdue } from "@/lib/dates";
import StageSelect from "@/components/tasks/StageSelect";
import { cn } from "@/lib/utils";

export default function TaskCard({ task, project, today, onOpen, onStageChange }) {
  const overdue = taskIsOverdue(task, today);
  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.media;
  const stage = STAGE_STYLES[task.stage] || STAGE_STYLES.para_iniciar;

  return (
    <article className={cn("card-surface p-3", overdue && "border-l-4 border-l-[#DC2626]")}>
      <button type="button" onClick={() => onOpen(task)} className="block w-full text-left">
        <p className={cn("text-sm font-medium text-foreground", task.stage === "finalizado" && "text-muted-foreground line-through")}>
          {task.title}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: priority.color }} />
            {priority.label}
          </span>
          <span className="text-slate-300">·</span>
          <span className={cn(overdue && "font-semibold text-[#DC2626]")}>{taskDueLabel(task)}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {project ? (
            <>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
              <span className="truncate">{project.name}</span>
            </>
          ) : (
            <span>Avulsa</span>
          )}
        </div>
      </button>

      <div className="mt-3 flex items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} />
        <StageSelect task={task} onChange={onStageChange} />
      </div>
    </article>
  );
}
