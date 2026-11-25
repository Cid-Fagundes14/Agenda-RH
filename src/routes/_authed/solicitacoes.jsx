import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { listTrainingDepartments, listTrainingRequests, listTrainingTitles, saveTrainingRequest } from "@/api/agenda";
import TrainingRequestForm from "@/components/training/TrainingRequestForm";
import TrainingSummary from "@/components/training/TrainingSummary";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/AuthContext";
import { formatBR } from "@/lib/dates";
import { exportTrainingExcel, exportTrainingPdf } from "@/lib/trainingExport";
import { compareTrainingUrgency, trainingSearchKey, TRAINING_STATUSES, TRAINING_URGENCIES } from "@/lib/trainingRequests";

export const Route = createFileRoute("/_authed/solicitacoes")({
  head: () => ({ meta: [{ title: "Solicitações de Treinamento · Agenda de RH" }] }),
  component: TrainingRequestsPage,
});

function RequestFilter({ label, value, onChange, options }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-11 min-w-0 rounded-md border bg-card px-2 text-sm focus-visible:outline-primary"
    >
      <option value="">{label}</option>
      {options.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
    </select>
  );
}

function TrainingRequestsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["training-requests", user?.id];
  const [search, setSearch] = useState("");
  const [training, setTraining] = useState("");
  const [department, setDepartment] = useState("");
  const [exporting, setExporting] = useState("");
  const [status, setStatus] = useState("");
  const [urgency, setUrgency] = useState("");
  const [form, setForm] = useState(null);
  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async () => {
      const [requests, titles, departments] = await Promise.all([
        listTrainingRequests(), listTrainingTitles(), listTrainingDepartments(),
      ]);
      const byTitle = (a, b) => a.title.localeCompare(b.title, "pt-BR");
      return { requests, titles: titles.sort(byTitle), departments: departments.sort(byTitle) };
    },
  });
  const { requests = [], titles = [], departments = [] } = query.data ?? {};
  const term = trainingSearchKey(search);
  const visible = requests.filter((request) => (
    (!training || request.training_title === training) &&
    (!department || request.department === department) &&
    (!status || request.status === status) &&
    (!urgency || request.urgency === urgency) &&
    [request.employee_name, request.registration, request.department, request.requester, request.training_title]
      .some((value) => trainingSearchKey(value).includes(term))
  )).sort(compareTrainingUrgency);

  const exportResults = async (format) => {
    setExporting(format);
    try {
      if (format === "pdf") {
        const filters = [
          training && `Treinamento: ${training}`,
          department && `Área: ${department}`,
          status && `Status: ${TRAINING_STATUSES.find(({ value }) => value === status)?.label}`,
          urgency && `Urgência: ${TRAINING_URGENCIES.find(({ value }) => value === urgency)?.label}`,
          term && `Busca: ${search.trim()}`,
        ].filter(Boolean);
        await exportTrainingPdf(visible, filters);
      } else {
        await exportTrainingExcel(visible);
      }
    } catch {
      toast.error("Não foi possível exportar as solicitações. Tente novamente.");
    } finally {
      setExporting("");
    }
  };

  const save = async (id, fields) => {
    await saveTrainingRequest(id, fields);
    setForm(null);
    toast.success(id ? "Solicitação atualizada." : "Solicitação registrada.");
    await queryClient.invalidateQueries({ queryKey });
  };

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-[2.25rem] sm:leading-tight">
          Solicitações de Treinamento
        </h1>
        <button
          type="button"
          disabled={!query.data}
          onClick={() => setForm({})}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Nova solicitação
        </button>
      </header>

      {query.isPending ? <p role="status" className="text-sm text-muted-foreground">Carregando solicitações...</p> : null}
      {query.isError ? (
        <div role="alert" className="card-surface p-4 text-sm">
          <p>Não foi possível carregar as solicitações.</p>
          <button type="button" onClick={() => query.refetch()} className="mt-2 min-h-11 rounded-md border px-3 font-medium">Tentar novamente</button>
        </div>
      ) : null}
      {query.data ? (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_270px]">
          <div className="min-w-0 space-y-3">
            <div className="card-surface agenda-panel space-y-3 p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Buscar solicitações"
                  placeholder="Buscar colaborador, matrícula, treinamento ou área"
                  maxLength={200}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="min-h-11 bg-card pl-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <RequestFilter label="Todos os treinamentos" value={training} onChange={setTraining} options={titles.map(({ title }) => ({ value: title, label: title }))} />
                <RequestFilter label="Todos os departamentos" value={department} onChange={setDepartment} options={departments.map(({ title }) => ({ value: title, label: title }))} />
                <RequestFilter label="Todos os status" value={status} onChange={setStatus} options={TRAINING_STATUSES} />
                <RequestFilter label="Todas as urgências" value={urgency} onChange={setUrgency} options={TRAINING_URGENCIES} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <p aria-live="polite" className="text-xs text-muted-foreground">
                  {visible.length} {visible.length === 1 ? "solicitação nos resultados" : "solicitações nos resultados"}
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
                      disabled={!visible.length || !!exporting}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-md border bg-card px-3 text-xs font-semibold hover:bg-secondary disabled:opacity-50"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      {exporting === value ? "Exportando..." : label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {visible.length === 0 ? (
              <p className="card-surface p-4 text-sm text-muted-foreground">
                {requests.length ? "Nenhuma solicitação corresponde aos filtros." : "Nenhuma solicitação cadastrada."}
              </p>
            ) : (
              <ul className="space-y-2">
                {visible.map((request) => {
                  const urgency = TRAINING_URGENCIES.find(({ value }) => value === request.urgency);
                  const status = TRAINING_STATUSES.find(({ value }) => value === request.status);
                  return (
                    <li key={request.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-3">
                      <div className="min-w-0 flex-1 basis-44">
                        <h2 className="break-words text-sm font-semibold">{request.training_title}</h2>
                        <p className="break-words text-sm text-muted-foreground">
                          {request.employee_name}{[request.registration, request.department].filter(Boolean).map((part) => ` · ${part}`).join("")}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-full bg-secondary px-2 py-1 font-medium">{status?.label}</span>
                          <span className={`rounded-full px-2 py-1 font-medium ${urgency?.style || "bg-secondary text-muted-foreground"}`}>{urgency?.label || "Sem urgência"}</span>
                          {request.training_date ? <span>Treinamento: {formatBR(request.training_date)}</span> : request.expected_completion_date ? <span>Prazo: {formatBR(request.expected_completion_date)}</span> : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Editar solicitação de ${request.employee_name}: ${request.training_title}`}
                        onClick={() => setForm(request)}
                        className="min-h-11 rounded-md border px-3 text-sm font-medium hover:bg-secondary"
                      >
                        Editar
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <TrainingSummary requests={requests} />
        </div>
      ) : null}

      {form ? (
        <TrainingRequestForm request={form.id ? form : null} titles={titles} departments={departments} onDismiss={() => setForm(null)} onSave={save} />
      ) : null}
    </div>
  );
}
