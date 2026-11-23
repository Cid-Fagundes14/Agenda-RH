import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Loader2, Plus } from "lucide-react";
import TodayHeader, { CollapsibleSection, SectionTitle } from "@/components/home/TodayHeader";
import TodayEvents from "@/components/home/TodayEvents";
import TaskItem from "@/components/tasks/TaskItem";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import TaskDetailsDialog from "@/components/tasks/TaskDetailsDialog";
import { useAgendaData } from "@/hooks/useAgendaData";
import { compareTaskStartTime, isTaskOpen, projectOccursOn, taskDueDate, taskIsOverdue, taskOccursOn, todayISO } from "@/lib/dates";

export const Route = createFileRoute("/_authed/")({
  head: () => ({ meta: [{ title: "Hoje · Agenda de RH" }] }),
  component: HojePage,
});

const PRIORITY_ORDER = { alta: 0, media: 1, baixa: 2 };

function sortToday(list, today) {
  return list.sort((a, b) => {
    const timeOrder = compareTaskStartTime(a, b);
    if (timeOrder !== 0) return timeOrder;
    const aDue = taskDueDate(a) === today ? 0 : 1;
    const bDue = taskDueDate(b) === today ? 0 : 1;
    if (aDue !== bDue) return aDue - bDue;
    return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
  });
}

function HojePage() {
  const today = todayISO();
  const { tasks, projects, loading, error, refresh, toggleTask } = useAgendaData();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const projectById = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project])),
    [projects]
  );

  const overdue = useMemo(
    () =>
      tasks
        .filter((task) => taskIsOverdue(task, today))
        .sort((a, b) => (taskDueDate(a) || "").localeCompare(taskDueDate(b) || "")),
    [tasks, today]
  );

  const todayOpen = useMemo(
    () => sortToday(tasks.filter((task) => isTaskOpen(task) && taskOccursOn(task, today)), today),
    [tasks, today]
  );

  const todayDone = useMemo(
    () => tasks.filter((task) => !isTaskOpen(task) && taskOccursOn(task, today)).sort(compareTaskStartTime),
    [tasks, today]
  );

  const todayEvents = useMemo(
    () => projects.filter((project) => projectOccursOn(project, today)),
    [projects, today]
  );

  const selectedTask = tasks.find((task) => task.id === selectedId) || null;

  const openNew = () => {
    setEditingTask(null);
    setFormOpen(true);
  };

  const openDetails = (task) => setSelectedId(task.id);

  const editTask = (task) => {
    setSelectedId(null);
    setEditingTask(task);
    setFormOpen(true);
  };

  return (
    <div>
      <TodayHeader today={today} onNewTask={openNew} />

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando sua agenda...
        </div>
      ) : error ? (
        <div className="card-surface flex flex-col items-start gap-3 p-5">
          <p className="text-sm font-medium text-foreground">Não foi possível carregar sua agenda.</p>
          <button
            type="button"
            onClick={refresh}
            className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[3fr_1fr] lg:items-start">
          <section className="lg:col-start-1 lg:row-start-1">
            {overdue.length > 0 ? (
              <>
                <div className="mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
                  <h2 className="font-heading text-[1.25rem] font-semibold text-foreground">
                    Atrasadas
                    <span className="ml-2 text-sm font-medium text-muted-foreground">{overdue.length}</span>
                  </h2>
                </div>
                <div className="space-y-2">
                  {overdue.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      project={projectById[task.project_id]}
                      overdue
                      onToggle={toggleTask}
                      onOpen={openDetails}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </section>

          <div className="lg:col-start-2 lg:row-span-3 lg:row-start-1">
            <TodayEvents projects={todayEvents} />
          </div>

          <section className="lg:col-start-1 lg:row-start-2">
            <SectionTitle count={todayOpen.length}>Tarefas de hoje</SectionTitle>
            {todayOpen.length === 0 ? (
              <div className="card-surface flex flex-col items-start gap-3 p-5">
                <p className="text-sm text-muted-foreground">Nenhuma tarefa agendada para hoje.</p>
                <button
                  type="button"
                  onClick={openNew}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium transition hover:bg-secondary"
                >
                  <Plus className="h-4 w-4" />
                  Nova tarefa
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayOpen.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    project={projectById[task.project_id]}
                    onToggle={toggleTask}
                    onOpen={openDetails}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="lg:col-start-1 lg:row-start-3">
            <CollapsibleSection title="Concluídas de hoje" count={todayDone.length}>
              {todayDone.length === 0 ? (
                <p className="card-surface p-4 text-sm text-muted-foreground">
                  Nada concluído para hoje ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {todayDone.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      project={projectById[task.project_id]}
                      onToggle={toggleTask}
                      onOpen={openDetails}
                    />
                  ))}
                </div>
              )}
            </CollapsibleSection>
          </section>
        </div>
      )}

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        projects={projects}
        task={editingTask}
        onSaved={refresh}
      />

      <TaskDetailsDialog
        open={!!selectedTask}
        onOpenChange={(open) => (!open ? setSelectedId(null) : null)}
        task={selectedTask}
        project={selectedTask ? projectById[selectedTask.project_id] : null}
        onToggle={toggleTask}
        onEdit={editTask}
        onDeleted={() => {
          setSelectedId(null);
          refresh();
        }}
      />
    </div>
  );
}
