import { STAGES } from "@/lib/taskConstants";

export default function StageSelect({ task, onChange, className = "" }) {
  const stage = STAGES.find((item) => item.value === task.stage) || STAGES[0];

  return (
    <select
      value={task.stage}
      onChange={(event) => onChange(task, event.target.value)}
      aria-label={`Etapa de ${task.title}`}
      className={`min-h-11 w-full rounded-md border border-border bg-white px-2 text-xs font-medium ${className}`}
      style={{ color: stage.color }}
    >
      {STAGES.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}
