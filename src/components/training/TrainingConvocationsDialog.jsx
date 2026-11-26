import { useState } from "react";
import ResponsiveDialog from "@/components/ui-shared/ResponsiveDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ATTENDANCE_OPTIONS } from "@/lib/trainingConvocations";

const FORM_ID = "training-convocations-form";
const newAttempt = () => ({ invited_on: "", training_on: "", attendance: "waiting", note: "" });

export default function TrainingConvocationsDialog({ request, onDismiss, onSave }) {
  const saved = request.convocations ?? [];
  const [attempts, setAttempts] = useState(() => saved.length ? saved : [newAttempt()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(index, values) {
    setAttempts((current) => current.map((attempt, position) =>
      position === index ? { ...attempt, ...values } : attempt));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await onSave(request.id, saved, attempts.map((attempt) => ({
        ...attempt,
        note: attempt.attendance === "absent" ? attempt.note.trim() : "",
      })));
    } catch {
      setError("Não foi possível salvar as convocações. Confira as datas e tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  const footer = (
    <div className="flex flex-wrap justify-end gap-2">
      <button type="button" onClick={onDismiss} disabled={saving} className="min-h-11 rounded-md border px-4 text-sm font-medium">
        Cancelar
      </button>
      <button type="submit" form={FORM_ID} disabled={saving} className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {saving ? "Salvando..." : "Salvar convocações"}
      </button>
    </div>
  );

  return (
    <ResponsiveDialog open onOpenChange={(open) => { if (!open && !saving) onDismiss(); }}
      title="Convocações" description={`${request.employee_name} · ${request.training_title}`} footer={footer}>
      <form id={FORM_ID} onSubmit={submit} className="space-y-4">
        {attempts.map((attempt, index) => {
          const field = `convocation-${index + 1}`;
          return (
            <fieldset key={field} disabled={saving} className="min-w-0 space-y-3 rounded-md border p-3">
              <legend className="px-1 text-sm font-semibold">{index + 1}ª convocação</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="min-w-0 space-y-1">
                  <Label htmlFor={`${field}-invited`}>Data da convocação</Label>
                  <Input id={`${field}-invited`} className="min-h-11 min-w-0" type="date" required
                    value={attempt.invited_on} onChange={(event) => update(index, { invited_on: event.target.value })} />
                </div>
                <div className="min-w-0 space-y-1">
                  <Label htmlFor={`${field}-training`}>Data prevista do treinamento</Label>
                  <Input id={`${field}-training`} className="min-h-11 min-w-0" type="date" required
                    min={attempt.invited_on || undefined} value={attempt.training_on}
                    onChange={(event) => update(index, { training_on: event.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${field}-attendance`}>Comparecimento</Label>
                <select id={`${field}-attendance`}
                  className="min-h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-ring disabled:opacity-70"
                  disabled={index >= saved.length || (index === 0 && attempts.length === 2)}
                  value={attempt.attendance}
                  onChange={(event) => update(index, { attendance: event.target.value })}>
                  {ATTENDANCE_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
              {attempt.attendance === "absent" ? (
                <div className="space-y-1">
                  <Label htmlFor={`${field}-note`}>Observação sobre a falta (opcional)</Label>
                  <Textarea id={`${field}-note`} value={attempt.note} maxLength={1000}
                    onChange={(event) => update(index, { note: event.target.value })} />
                </div>
              ) : null}
              {index === 1 && saved.length === 1 ? (
                <button type="button" className="agenda-link min-h-11 text-sm font-medium"
                  onClick={() => setAttempts((current) => current.slice(0, 1))}>Cancelar 2ª convocação</button>
              ) : null}
            </fieldset>
          );
        })}
        {attempts.length === 1 && attempts[0].attendance === "absent" ? (
          <button type="button" disabled={saving} onClick={() => setAttempts((current) => [...current, newAttempt()])}
            className="min-h-11 rounded-md border bg-card px-3 text-sm font-medium hover:bg-secondary">
            Registrar 2ª convocação
          </button>
        ) : null}
        {error ? <p role="alert" className="agenda-danger-text text-sm">{error}</p> : null}
      </form>
    </ResponsiveDialog>
  );
}
