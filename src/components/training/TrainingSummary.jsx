import { TRAINING_STATUSES, TRAINING_TYPES, TRAINING_URGENCIES } from "@/lib/trainingRequests";

const GROUPS = [
  { label: "Por status", field: "status", options: TRAINING_STATUSES },
  { label: "Por urgência", field: "urgency", options: [...TRAINING_URGENCIES, { value: null, label: "Sem urgência" }] },
  { label: "Por tipo", field: "training_type", options: [...TRAINING_TYPES, { value: null, label: "Sem tipo" }] },
];

export default function TrainingSummary({ requests }) {
  return (
    <aside className="card-surface agenda-panel space-y-4 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold">Resumo</h2>
        <span className="text-xs text-muted-foreground">{requests.length} no total</span>
      </div>
      {GROUPS.map(({ label, field, options }) => {
        const counts = new Map();
        for (const request of requests) {
          const value = request[field] || null;
          counts.set(value, (counts.get(value) || 0) + 1);
        }
        return (
          <section key={field} className="border-t pt-3">
            <h3 className="mb-1 text-sm font-semibold">{label}</h3>
            <dl className="space-y-1 text-sm">
              {options.map(({ value, label }) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium tabular-nums">{counts.get(value) || 0}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </aside>
  );
}
