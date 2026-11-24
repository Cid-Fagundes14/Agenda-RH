import { Link } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { addDays, formatBRShort, isTaskOpen, projectRange, taskRange, taskStartTime } from "@/lib/dates";

const DAYS_AHEAD = 15;
const DAY_MS = 86400000;

function daysUntil(today, date) {
  return (Date.parse(date) - Date.parse(today)) / DAY_MS;
}

function proximityStyle(days) {
  if (days < 3) return "border-red-200 bg-red-50 text-red-800";
  if (days < 7) return "border-orange-200 bg-orange-50 text-orange-800";
  if (days <= 10) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-blue-200 bg-blue-50 text-blue-800";
}

export default function UpcomingActivities({ tasks, projects, today, onOpenTask }) {
  const lastDay = addDays(today, DAYS_AHEAD);
  const activities = [
    ...tasks.filter(isTaskOpen).map((task) => ({
      task,
      id: task.id,
      title: task.title,
      date: taskRange(task)?.start,
      time: taskStartTime(task),
    })),
    ...projects.map((project) => ({
      id: project.id,
      title: project.name,
      date: projectRange(project)?.start,
    })),
  ].filter(({ date }) => date && date > today && date <= lastDay)
    .sort((a, b) => a.date.localeCompare(b.date)
      || (a.time || "24:00").localeCompare(b.time || "24:00")
      || a.title.localeCompare(b.title, "pt-BR"));

  return (
    <section className="card-surface agenda-panel min-w-0 p-4 max-lg:order-last" aria-labelledby="upcoming-activities-title">
      <h2 id="upcoming-activities-title" className="flex items-center gap-2 font-heading text-base font-semibold">
        <CalendarClock className="h-4 w-4 shrink-0 text-sidebar-primary" aria-hidden="true" />
        Atividades próximas
      </h2>
      {activities.length ? (
        <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
          {activities.map(({ task, id, title, date, time }) => {
            const days = daysUntil(today, date);
            const className = `block w-full min-w-0 rounded-md border px-2.5 py-2 text-left focus-visible:outline-primary ${proximityStyle(days)}`;
            const content = (
              <>
                <span className="block break-words text-sm font-semibold">{title}</span>
                <span className="block text-xs">
                  {task ? "Tarefa" : "Evento"} · {formatBRShort(date)}{time ? ` às ${time}` : ""} · {days === 1 ? "Amanhã" : `Em ${days} dias`}
                </span>
              </>
            );
            return (
              <li key={`${task ? "task" : "project"}-${id}`}>
                {task ? (
                  <button type="button" onClick={() => onOpenTask(task)} className={className}>{content}</button>
                ) : (
                  <Link to="/projetos/$projectId" params={{ projectId: id }} className={className}>{content}</Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">Nenhuma atividade marcada para os próximos 15 dias.</p>
      )}
    </section>
  );
}
