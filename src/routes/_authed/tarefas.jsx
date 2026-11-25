import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import TaskDetailsDialog from "@/components/tasks/TaskDetailsDialog";
import { useAgendaData } from "@/hooks/useAgendaData";
import { PRIORITIES, PRIORITY_STYLES, STAGES, STAGE_STYLES } from "@/lib/taskConstants";
import { exportTasksExcel, exportTasksPdf } from "@/lib/taskExport";
import { taskIsOverdue, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/tarefas")({
  head: () => ({ meta: [{ title: "Tarefas · Agenda de RH" }] }),
  component: TarefasPage,
});

const ALL = "__all__";
const STANDALONE = "__none__";

function TarefasPage() {
  const today = todayISO();
  const { tasks, projects, loading, error, refresh, setStage, toggleTask } = useAgendaData();
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState(ALL);
  const [projectFilter, setProjectFilter] = useState(ALL);
  const [stageFilter, setStageFilter] = useState(ALL);
  const [exporting, setExporting] = useState("");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [onlyNoDate, setOnlyNoDate] = useState(false);
  const [stageTab, setStageTab] = useState("para_iniciar");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const projectById = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project])),
    [projects]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (term && !`${task.title} ${task.requester || ""}`.toLowerCase().includes(term)) return false;
      if (priority !== ALL && task.priority !== priority) return false;
      if (stageFilter !== ALL && task.stage !== stageFilter) return false;
      if (projectFilter !== ALL) {
        if (projectFilter === STANDALONE ? !!task.project_id : task.project_id !== projectFilter) return false;
      }
      if (onlyOverdue && !taskIsOverdue(task, today)) return false;
      if (onlyNoDate && task.schedule_type !== "none") return false;
      return true;
    });
  }, [tasks, search, priority, projectFilter, stageFilter, onlyOverdue, onlyNoDate, today]);

  const columns = STAGES.map((stage) => ({
    ...stage,
    items: filtered.filter((task) => task.stage === stage.value),
  }));

  const mobileStage = stageFilter === ALL ? stageTab : stageFilter;

  const exportResults = async (format) => {
    setExporting(format);
    try {
      if (format === "pdf") {
        const projectName = projectFilter === STANDALONE ? "Avulsa" : projectById[projectFilter]?.name;
        const filters = [
          search.trim() && `Busca: ${search.trim()}`,
          priority !== ALL && `Prioridade: ${PRIORITY_STYLES[priority].label}`,
          projectName && `Projeto: ${projectName}`,
          stageFilter !== ALL && `Etapa: ${STAGE_STYLES[stageFilter].label}`,
          onlyOverdue && "Somente atrasadas",
          onlyNoDate && "Somente sem data",
        ].filter(Boolean);
        await exportTasksPdf(columns, projectById, today, filters);
      } else {
        await exportTasksExcel(columns, projectById, today);
      }
    } catch {
      toast.error("Não foi possível exportar as tarefas. Tente novamente.");
    } finally {
      setExporting("");
    }
  };

  const selectedTask = tasks.find((task) => task.id === selectedId) || null;

  const editTask = (task) => {
    setSelectedId(null);
    setEditingTask(task);
    setFormOpen(true);
  };

  const filterChip = (active, onClick, children) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-11 rounded-md border px-3 text-xs font-medium transition",
        active ? "border-primary bg-accent text-accent-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );

  return (
    <div>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="meta-label">Quadro</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-[2.25rem] sm:leading-tight">
            Tarefas
          </h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingTask(null);
            setFormOpen(true);
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[var(--agenda-button-hover)]"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Nova tarefa</span>
        </button>
      </header>

      <div className="card-surface agenda-panel mb-4 space-y-3 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título ou solicitante"
            maxLength={250}
            className="min-h-11 pl-9"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger aria-label="Filtrar por prioridade" className="min-h-11">
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as prioridades</SelectItem>
              {PRIORITIES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger aria-label="Filtrar por projeto" className="min-h-11">
              <SelectValue placeholder="Projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos os projetos</SelectItem>
              <SelectItem value={STANDALONE}>Somente avulsas</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger aria-label="Filtrar por etapa" className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todas as etapas</SelectItem>
              {STAGES.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            {filterChip(onlyOverdue, () => setOnlyOverdue((v) => !v), "Atrasadas")}
            {filterChip(onlyNoDate, () => setOnlyNoDate((v) => !v), "Sem data")}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <p aria-live="polite" className="text-xs text-muted-foreground">
            {loading || error ? "Exportação de tarefas" :
              `${filtered.length} ${filtered.length === 1 ? "tarefa será exportada" : "tarefas serão exportadas"}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "pdf", label: "Exportar PDF" },
              { value: "xlsx", label: "Exportar Excel" },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => exportResults(value)}
                disabled={loading || !!error || !filtered.length || !!exporting}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md border bg-card px-3 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {exporting === value ? "Exportando..." : label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando tarefas...
        </div>
      ) : error ? (
        <div className="card-surface p-5">
          <p className="text-sm font-medium">Não foi possível carregar as tarefas.</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-3 min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          {/* Celular: etapas em abas */}
          {stageFilter === ALL ? (
            <div className="mb-4 grid grid-cols-3 gap-1 agenda-panel rounded-md border p-1 lg:hidden">
              {columns.map((column) => (
                <button
                  key={column.value}
                  type="button"
                  onClick={() => setStageTab(column.value)}
                  aria-pressed={stageTab === column.value}
                  className={cn(
                    "min-h-11 rounded-[5px] text-xs font-medium transition",
                    stageTab === column.value ? "bg-card text-sidebar-primary shadow-sm" : "text-muted-foreground"
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
                    {column.label}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="agenda-panel space-y-2 rounded-lg border p-3 lg:hidden">
            {columns
              .filter((column) => column.value === mobileStage)
              .flatMap((column) => column.items)
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  project={projectById[task.project_id]}
                  today={today}
                  onOpen={(item) => setSelectedId(item.id)}
                  onStageChange={setStage}
                />
              ))}
            {columns.find((column) => column.value === mobileStage)?.items.length === 0 ? (
              <p className="card-surface p-5 text-center text-sm text-muted-foreground">
                Nenhuma tarefa nesta etapa.
              </p>
            ) : null}
          </div>

          {/* Computador: quadro com três colunas */}
          <div className="hidden gap-4 lg:grid lg:grid-cols-3">
            {columns.map((column) => (
              <section key={column.value} className="agenda-panel rounded-lg border p-3">
                <header className="mb-3 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                  <h2 className="font-heading text-sm font-semibold text-sidebar-primary">{column.label}</h2>
                  <span className="text-xs font-medium text-muted-foreground">{column.items.length}</span>
                </header>
                <div className="space-y-2">
                  {column.items.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      project={projectById[task.project_id]}
                      today={today}
                      onOpen={(item) => setSelectedId(item.id)}
                      onStageChange={setStage}
                    />
                  ))}
                  {column.items.length === 0 ? (
                    <p className="rounded-md border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                      Nada aqui.
                    </p>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </>
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
