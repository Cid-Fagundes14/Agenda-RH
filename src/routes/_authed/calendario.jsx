import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import CalendarMonth from "@/components/calendar/CalendarMonth";
import DayAgenda from "@/components/calendar/DayAgenda";
import TaskDetailsDialog from "@/components/tasks/TaskDetailsDialog";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import { useAgendaData } from "@/hooks/useAgendaData";
import { monthTitle, todayISO } from "@/lib/dates";

export const Route = createFileRoute("/_authed/calendario")({
  head: () => ({ meta: [{ title: "Calendário · Agenda de RH" }] }),
  component: CalendarioPage,
});

function CalendarioPage() {
  const today = todayISO();
  const { tasks, projects, loading, error, refresh, toggleTask } = useAgendaData();
  const [cursor, setCursor] = useState(() => ({
    year: Number(today.slice(0, 4)),
    month: Number(today.slice(5, 7)) - 1,
  }));
  const [selected, setSelected] = useState(today);
  const [selectedId, setSelectedId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const shiftMonth = (delta) => {
    setCursor((prev) => {
      const next = new Date(prev.year, prev.month + delta, 1, 12);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  };

  const goToday = () => {
    setCursor({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) - 1 });
    setSelected(today);
  };

  const selectedTask = tasks.find((task) => task.id === selectedId) || null;
  const projectById = Object.fromEntries(projects.map((project) => [project.id, project]));

  return (
    <div>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="meta-label">Agenda</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-[2.25rem] sm:leading-tight">
            Calendário
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToday}
            className="min-h-11 rounded-md border border-border bg-white px-3 text-sm font-medium transition hover:bg-secondary"
          >
            Hoje
          </button>
          <div className="flex items-center rounded-md border border-border bg-white">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Mês anterior"
              className="flex h-11 w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[140px] text-center text-sm font-semibold text-foreground">
              {monthTitle(cursor.year, cursor.month)}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Próximo mês"
              className="flex h-11 w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando calendário...
        </div>
      ) : error ? (
        <div className="card-surface p-5">
          <p className="text-sm font-medium">Não foi possível carregar o calendário.</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[2fr_1fr] lg:items-start">
          <CalendarMonth
            year={cursor.year}
            month={cursor.month}
            selected={selected}
            onSelect={setSelected}
            tasks={tasks}
            projects={projects}
            today={today}
          />
          <div className="lg:sticky lg:top-5">
            <DayAgenda
              date={selected}
              tasks={tasks}
              projects={projects}
              onToggleTask={toggleTask}
              onOpenTask={(task) => setSelectedId(task.id)}
            />
          </div>
        </div>
      )}

      <TaskDetailsDialog
        open={!!selectedTask}
        onOpenChange={(open) => (!open ? setSelectedId(null) : null)}
        task={selectedTask}
        project={selectedTask ? projectById[selectedTask.project_id] : null}
        onToggle={toggleTask}
        onEdit={(task) => {
          setSelectedId(null);
          setEditingTask(task);
          setFormOpen(true);
        }}
        onDeleted={() => {
          setSelectedId(null);
          refresh();
        }}
      />

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        projects={projects}
        task={editingTask}
        defaults={{ schedule_type: "day", date: selected }}
        onSaved={refresh}
      />
    </div>
  );
}
