import { useState } from "react";
import { Plus } from "lucide-react";
import { longDate } from "@/lib/dates";

export default function TodayHeader({ today, onNewTask }) {
  return (
    <header className="mb-5 flex items-start justify-between gap-3">
      <div>
        <p className="meta-label">Hoje</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-[2.25rem] sm:leading-tight">
          {longDate(today)}
        </h1>
      </div>
      <button
        type="button"
        onClick={onNewTask}
        className="hidden min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[#1D4ED8] sm:inline-flex"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Nova tarefa
      </button>
      <button
        type="button"
        onClick={onNewTask}
        aria-label="Nova tarefa"
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground sm:hidden"
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </header>
  );
}

export function SectionTitle({ children, count, action }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h2 className="font-heading text-[1.25rem] font-semibold tracking-tight text-foreground">
        {children}
        {typeof count === "number" ? (
          <span className="ml-2 align-middle text-sm font-medium text-muted-foreground">{count}</span>
        ) : null}
      </h2>
      {action}
    </div>
  );
}

export function CollapsibleSection({ title, count, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-2 flex min-h-11 w-full items-center justify-between gap-2 text-left"
      >
        <h2 className="font-heading text-[1.25rem] font-semibold tracking-tight text-foreground">
          {title}
          <span className="ml-2 align-middle text-sm font-medium text-muted-foreground">{count}</span>
        </h2>
        <span className="text-xs font-medium text-muted-foreground">{open ? "Ocultar" : "Mostrar"}</span>
      </button>
      {open ? children : null}
    </section>
  );
}
