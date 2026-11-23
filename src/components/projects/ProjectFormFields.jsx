import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PROJECT_COLORS, SCHEDULE_OPTIONS } from "@/lib/taskConstants";
import { cn } from "@/lib/utils";

export default function ProjectFormFields({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="project-name">Nome *</Label>
        <Input
          id="project-name"
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Ex.: Treinamento NR-20"
          className="min-h-11"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Cor no calendário</Label>
        <div className="flex flex-wrap gap-2">
          {PROJECT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => set({ color })}
              aria-label={`Cor ${color}`}
              aria-pressed={value.color === color}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-md border-2 transition",
                value.color === color ? "border-foreground" : "border-transparent"
              )}
            >
              <span className="h-6 w-6 rounded-full" style={{ backgroundColor: color }} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Data do evento</Label>
        <div className="grid grid-cols-3 gap-1 rounded-md border border-border bg-secondary p-1">
          {SCHEDULE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => set({ event_type: option.value })}
              className={cn(
                "min-h-10 rounded-[5px] text-xs font-medium transition",
                value.event_type === option.value
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          O evento aparece no calendário em todos os dias do período.
        </p>
      </div>

      {value.event_type === "day" ? (
        <div className="space-y-1.5">
          <Label htmlFor="project-date">Data</Label>
          <Input
            id="project-date"
            type="date"
            value={value.event_date || ""}
            onChange={(e) => set({ event_date: e.target.value })}
            className="min-h-11"
          />
        </div>
      ) : null}

      {value.event_type === "range" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="project-start">Início</Label>
            <Input
              id="project-start"
              type="date"
              value={value.event_start || ""}
              onChange={(e) => set({ event_start: e.target.value })}
              className="min-h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="project-end">Fim</Label>
            <Input
              id="project-end"
              type="date"
              min={value.event_start || undefined}
              value={value.event_end || ""}
              onChange={(e) => set({ event_end: e.target.value })}
              className="min-h-11"
            />
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="project-notes">Anotações</Label>
        <Textarea
          id="project-notes"
          value={value.notes || ""}
          onChange={(e) => set({ notes: e.target.value })}
          rows={3}
          placeholder="Objetivo, público, turmas, responsáveis"
        />
      </div>
    </div>
  );
}
