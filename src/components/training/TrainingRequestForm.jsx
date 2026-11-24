import { useState } from "react";
import ResponsiveDialog from "@/components/ui-shared/ResponsiveDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { todayISO } from "@/lib/dates";
import { TRAINING_MODALITIES, TRAINING_STATUSES, TRAINING_TYPES, TRAINING_URGENCIES } from "@/lib/trainingRequests";

const FORM_ID = "training-request-form";
const CERTIFICATE_OPTIONS = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

export default function TrainingRequestForm({ request, titles, departments, onDismiss, onSave }) {
  const [values, setValues] = useState(() => ({
    requested_date: todayISO(),
    status: "pendente",
    ...request,
    certificate_issued: request?.certificate_issued == null ? "" : request.certificate_issued ? "sim" : "nao",
  }));
  const [closed, setClosed] = useState(request?.status === "finalizado");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const update = (name, value) => setValues((previous) => ({ ...previous, [name]: value }));
  const certificateIssued = values.certificate_issued === "sim";

  const input = (name, label, props = {}) => (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        value={values[name] ?? ""}
        onChange={(event) => update(name, event.target.value)}
        className="min-h-11 min-w-0"
        {...props}
      />
    </div>
  );

  const select = (name, label, options, { disabled = false, empty = "A definir" } = {}) => (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        className="min-h-11 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-primary disabled:opacity-60"
        value={name === "status" && closed ? "finalizado" : values[name] ?? ""}
        onChange={(event) => update(name, event.target.value)}
        disabled={disabled}
      >
        {empty ? <option value="">{empty}</option> : null}
        {options.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
  );

  const submit = async (event) => {
    event.preventDefault();
    const employee = (values.employee_name || "").trim();
    const title = (values.training_title || "").trim().replace(/\s+/g, " ");
    if (!employee || !title) {
      setError("Informe o colaborador e o treinamento solicitado.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const optional = (key) => String(values[key] ?? "").trim() || null;
      await onSave(request?.id, {
        employee_name: employee,
        training_title: title,
        registration: optional("registration"),
        department: optional("department"),
        requester: optional("requester"),
        training_type: optional("training_type"),
        modality: optional("modality"),
        location: optional("location"),
        duration_hours: optional("duration_hours"),
        requested_date: optional("requested_date"),
        status: closed ? "finalizado" : values.status,
        expected_completion_date: optional("expected_completion_date"),
        training_date: optional("training_date"),
        completion_date: closed ? optional("completion_date") || todayISO() : null,
        facilitator: optional("facilitator"),
        estimated_cost: optional("estimated_cost"),
        actual_cost: optional("actual_cost"),
        certificate_issued: values.certificate_issued ? certificateIssued : null,
        urgency: optional("urgency"),
        notes: optional("notes"),
      });
    } catch {
      setError("Não foi possível salvar a solicitação. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <button type="button" disabled={saving} onClick={onDismiss} className="min-h-11 rounded-md border px-4 text-sm font-medium">
        Cancelar
      </button>
      <button type="submit" form={FORM_ID} disabled={saving} className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {saving ? "Salvando..." : "Salvar solicitação"}
      </button>
    </div>
  );

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => { if (!open && !saving) onDismiss(); }}
      title={request ? "Editar solicitação" : "Nova solicitação"}
      description="Informe o colaborador e o treinamento. Você pode completar o restante depois."
      footer={footer}
    >
      <form id={FORM_ID} onSubmit={submit} className="space-y-5">
        <fieldset className="grid min-w-0 gap-3 sm:grid-cols-2">
          <legend className="mb-2 text-sm font-semibold">Pedido</legend>
          {input("employee_name", "Nome do colaborador *", { required: true, maxLength: 160 })}
          {input("registration", "Matrícula", { maxLength: 80 })}
          <div className="min-w-0">
            {input("department", "Departamento / Área", { maxLength: 160, list: "training-department-options" })}
            <datalist id="training-department-options">
              {departments.map(({ id, title }) => <option key={id} value={title} />)}
            </datalist>
          </div>
          {input("requester", "Gestor solicitante", { maxLength: 160 })}
          <div className="min-w-0 sm:col-span-2">
            {input("training_title", "Treinamento solicitado *", { required: true, maxLength: 200, list: "training-title-options" })}
            <datalist id="training-title-options">
              {titles.map(({ id, title }) => <option key={id} value={title} />)}
            </datalist>
          </div>
          {select("training_type", "Tipo de treinamento", TRAINING_TYPES)}
          {select("urgency", "Nível de urgência", TRAINING_URGENCIES)}
          {input("requested_date", "Data da solicitação", { type: "date" })}
        </fieldset>

        <fieldset className="grid min-w-0 gap-3 border-t pt-2 sm:grid-cols-2">
          <legend className="pr-2 text-sm font-semibold">Planejamento</legend>
          {select("status", "Status", closed ? TRAINING_STATUSES : TRAINING_STATUSES.slice(0, -1), { disabled: closed, empty: "" })}
          {select("modality", "Modalidade", TRAINING_MODALITIES)}
          {input("location", "Local", { maxLength: 200 })}
          {input("facilitator", "Facilitador", { maxLength: 160 })}
          {input("duration_hours", "Carga horária (h)", { type: "number", min: "0.01", max: "9999999.99", step: "0.01" })}
          {input("expected_completion_date", "Data prevista de conclusão", { type: "date" })}
          {input("training_date", "Data do treinamento", { type: "date" })}
          {input("estimated_cost", "Custo estimado (R$)", { type: "number", min: "0", max: "9999999999.99", step: "0.01" })}
          {input("actual_cost", "Custo real (R$)", { type: "number", min: "0", max: "9999999999.99", step: "0.01" })}
        </fieldset>

        <fieldset className="space-y-3 border-t pt-2">
          <legend className="pr-2 text-sm font-semibold">Encerramento</legend>
          {select("certificate_issued", "Certificado emitido", CERTIFICATE_OPTIONS, { disabled: closed, empty: "Não informado" })}
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={closed}
              disabled={!certificateIssued}
              onChange={(event) => {
                const closing = event.target.checked;
                setClosed(closing);
                if (closing && !values.completion_date) update("completion_date", todayISO());
                if (!closing && values.status === "finalizado") update("status", values.training_date ? "agendado" : "tratativa");
              }}
              className="h-4 w-4 accent-blue-600"
            />
            Encerrar solicitação
          </label>
          {!certificateIssued ? <p className="text-xs text-muted-foreground">Marque o certificado como emitido para liberar o encerramento.</p> : null}
          {closed ? input("completion_date", "Data de finalização", { type: "date", required: true }) : null}
        </fieldset>

        <div className="space-y-1.5">
          <Label htmlFor="training-notes">Observações</Label>
          <Textarea id="training-notes" value={values.notes ?? ""} onChange={(event) => update("notes", event.target.value)} maxLength={4000} />
        </div>
        {error ? <p role="alert" className="text-sm text-red-800">{error}</p> : null}
      </form>
    </ResponsiveDialog>
  );
}
