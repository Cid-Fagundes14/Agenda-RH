import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { taskStartTime } from "@/lib/dates";
import { PRIORITIES, SCHEDULE_OPTIONS, STAGES } from "@/lib/taskConstants";
import { cn } from "@/lib/utils";

const NO_PROJECT = "__none__";

export default function TaskFormFields({ value, onChange, projects = [], hideProject = false }) {
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="task-title">Título *</Label>
        <Input
          id="task-title"
          value={value.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Ex.: Confirmar presenças do treinamento"
          className="min-h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="task-requester">Solicitante</Label>
        <Input
          id="task-requester"
          value={value.requester || ""}
          onChange={(e) => set({ requester: e.target.value })}
          placeholder="Quem pediu essa tarefa"
          className="min-h-11"
        />
      </div>

      {!hideProject ? (
        <div className="space-y-1.5">
          <Label htmlFor="task-project">Projeto</Label>
          <Select
            value={value.project_id || NO_PROJECT}
            onValueChange={(v) => set({ project_id: v === NO_PROJECT ? "" : v })}
          >
            <SelectTrigger id="task-project" className="min-h-11">
              <SelectValue placeholder="Sem projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_PROJECT}>Sem projeto (avulsa)</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="task-priority">Prioridade</Label>
          <Select value={value.priority} onValueChange={(v) => set({ priority: v })}>
            <SelectTrigger id="task-priority" className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="task-stage">Etapa</Label>
          <Select value={value.stage} onValueChange={(v) => set({ stage: v })}>
            <SelectTrigger id="task-stage" className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Agendamento</Label>
        <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-secondary p-1">
          {SCHEDULE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => set({ schedule_type: option.value })}
              className={cn(
                "min-h-10 rounded-[5px] text-xs font-medium transition",
                value.schedule_type === option.value
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {value.schedule_type === "day" ? (
        <div className="space-y-1.5">
          <Label htmlFor="task-date">Data</Label>
          <Input
            id="task-date"
            type="date"
            value={value.date || ""}
            onChange={(e) => set({ date: e.target.value })}
            className="min-h-11"
          />
        </div>
      ) : null}

      {value.schedule_type === "range" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="task-start">Data de início</Label>
            <Input
              id="task-start"
              type="date"
              value={value.start_date || ""}
              onChange={(e) => set({ start_date: e.target.value })}
              className="min-h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="task-end">Prazo final</Label>
            <Input
              id="task-end"
              type="date"
              value={value.end_date || ""}
              min={value.start_date || undefined}
              onChange={(e) => set({ end_date: e.target.value })}
              className="min-h-11"
            />
          </div>
        </div>
      ) : null}

      {value.schedule_type !== "none" ? (
        <div className="space-y-1.5">
          <Label htmlFor="task-time">Hora de início (opcional)</Label>
          <Input
            id="task-time"
            type="time"
            value={taskStartTime(value)}
            onChange={(e) => set({ start_time: e.target.value })}
            className="min-h-11 min-w-0"
            aria-describedby={value.schedule_type === "range" ? "task-time-help" : undefined}
          />
          {value.schedule_type === "range" ? (
            <p id="task-time-help" className="text-xs text-muted-foreground">
              O horário vale para todos os dias do período.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="task-notes">Anotações</Label>
        <Textarea
          id="task-notes"
          value={value.notes || ""}
          onChange={(e) => set({ notes: e.target.value })}
          rows={3}
          placeholder="Detalhes, combinados, links"
        />
      </div>
    </div>
  );
}
