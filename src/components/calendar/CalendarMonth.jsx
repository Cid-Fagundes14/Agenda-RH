import { cn } from "@/lib/utils";
import { monthGrid, projectOccursOn, taskOccursOn } from "@/lib/dates";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function CalendarMonth({ year, month, selected, onSelect, tasks, projects, today }) {
  const days = monthGrid(year, month);

  return (
    <div className="card-surface overflow-hidden">
      <div className="grid grid-cols-7 border-b border-border bg-secondary">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground sm:text-[11px]"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((iso) => {
          const inMonth = Number(iso.slice(5, 7)) === month + 1;
          const dayProjects = projects.filter((project) => projectOccursOn(project, iso));
          const dayTasks = tasks.filter((task) => taskOccursOn(task, iso));
          const isSelected = iso === selected;
          const isToday = iso === today;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={cn(
                "flex min-h-[62px] flex-col gap-1 border-b border-r border-border p-1.5 text-left transition last:border-r-0 hover:bg-secondary sm:min-h-[96px]",
                !inMonth && "bg-slate-50/70",
                isSelected && "bg-accent"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                  !inMonth ? "text-muted-foreground" : "text-foreground",
                  isToday && "bg-primary text-primary-foreground",
                  isSelected && !isToday && "text-accent-foreground"
                )}
              >
                {Number(iso.slice(8, 10))}
              </span>

              <div className="hidden min-w-0 space-y-1 sm:block">
                {dayProjects.slice(0, 2).map((project) => (
                  <span
                    key={project.id}
                    className="block truncate rounded px-1 py-0.5 text-[10px] font-medium text-white"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.name}
                  </span>
                ))}
                {dayProjects.length > 2 ? (
                  <span className="block px-1 text-[10px] text-muted-foreground">+{dayProjects.length - 2}</span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {dayProjects.map((project) => (
                  <span
                    key={project.id}
                    className="h-1.5 w-1.5 rounded-full sm:hidden"
                    style={{ backgroundColor: project.color }}
                  />
                ))}
                {dayTasks.slice(0, 5).map((task) => (
                  <span
                    key={task.id}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      task.stage === "finalizado" ? "bg-[#059669]" : "bg-slate-400"
                    )}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
