import { STAGES } from "@/lib/taskConstants";

export default function StageSelect({ task, onChange, className = "" }) {
  const stage = STAGES.find((item) => item.value === task.stage) || STAGES[0];

  return (
    <select
      value={task.stage}
      onChange={(event) => onChange(task, event.target.value)}
      aria-label={`Etapa de ${task.title}`}
      className={`agenda-stage min-h-11 w-full rounded-md border border-border bg-card px-2 text-xs font-medium ${className}`}
      data-stage={stage.value}
    >
      {STAGES.map((item) => (
        <option key={item.value} value={item.value} className="text-foreground">
          {item.label}
        </option>
      ))}
    </select>
  );
}
