import { formatBR, todayISO } from "@/lib/dates";
import { TRAINING_MODALITIES, TRAINING_STATUSES, TRAINING_TYPES, TRAINING_URGENCIES } from "@/lib/trainingRequests";

const REPORT_TITLE = "Solicitações de Treinamento";
const reportName = (extension) => `solicitacoes-treinamento-${todayISO()}.${extension}`;
const labelFor = (options, value) => options.find((item) => item.value === value)?.label || "";
const certificateLabel = (value) => value == null ? "" : value ? "Sim" : "Não";
const dateCell = (date) => date ? { value: new Date(`${date}T00:00:00Z`), format: "dd/mm/yyyy" } : null;
const numberCell = (number, format) => number == null || number === "" ? null : { value: Number(number), format };
const moneyCell = (number) => numberCell(number, '"R$" #,##0.00');

const HEADERS = [
  "Matrícula", "Nome do colaborador", "Departamento / Área", "Gestor solicitante",
  "Treinamento solicitado", "Tipo de treinamento", "Modalidade", "Local",
  "Carga horária (h)", "Data da solicitação", "Status", "Data prevista de conclusão",
  "Data do treinamento", "Data de finalização", "Facilitador", "Custo estimado (R$)",
  "Custo real (R$)", "Certificado emitido", "Nível de urgência", "Observações",
];
const WIDTHS = [14, 28, 24, 24, 32, 24, 17, 24, 17, 20, 25, 26, 21, 20, 24, 22, 18, 21, 20, 48];

export async function exportTrainingExcel(requests) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const header = HEADERS.map((value) => ({
    value, fontWeight: "bold", backgroundColor: "#284876", textColor: "#FFFFFF", wrap: true,
  }));
  const data = requests.map((request) => [
    request.registration,
    request.employee_name,
    request.department,
    request.requester,
    request.training_title,
    labelFor(TRAINING_TYPES, request.training_type),
    labelFor(TRAINING_MODALITIES, request.modality),
    request.location,
    numberCell(request.duration_hours, "0.##"),
    dateCell(request.requested_date),
    labelFor(TRAINING_STATUSES, request.status),
    dateCell(request.expected_completion_date),
    dateCell(request.training_date),
    dateCell(request.completion_date),
    request.facilitator,
    moneyCell(request.estimated_cost),
    moneyCell(request.actual_cost),
    certificateLabel(request.certificate_issued),
    labelFor(TRAINING_URGENCIES, request.urgency),
    request.notes ? { value: request.notes, wrap: true } : null,
  ]);

  await writeExcelFile([header, ...data], {
    sheet: "Solicitações",
    columns: WIDTHS.map((width) => ({ width })),
    stickyRowsCount: 1,
  }).toFile(reportName("xlsx"));
}

export async function exportTrainingPdf(requests, reportFilters) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setProperties({ title: REPORT_TITLE });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(32, 55, 89);
  doc.setFontSize(17);
  doc.text(REPORT_TITLE, 12, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${formatBR(todayISO())}  |  ${requests.length} ${requests.length === 1 ? "solicitação" : "solicitações"}`, 12, 22);
  const filters = reportFilters.length ? reportFilters.join("  |  ") : "Todas as solicitações";
  const filterLines = doc.splitTextToSize(filters, 273);
  doc.text(filterLines, 12, 27);
  autoTable(doc, {
    startY: 30 + (filterLines.length - 1) * 4,
    margin: { left: 12, right: 12, top: 13, bottom: 14 },
    head: [["Colaborador", "Matrícula", "Departamento / Área", "Treinamento", "Status", "Urgência", "Prazo previsto", "Data do treinamento", "Certificado"]],
    body: requests.map((request) => [
      request.employee_name, request.registration, request.department, request.training_title,
      labelFor(TRAINING_STATUSES, request.status), labelFor(TRAINING_URGENCIES, request.urgency),
      formatBR(request.expected_completion_date), formatBR(request.training_date),
      certificateLabel(request.certificate_issued),
    ].map((value) => value || "—")),
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2.2, overflow: "linebreak" },
    headStyles: { fillColor: [40, 72, 118] },
    theme: "striped",
    rowPageBreak: "avoid",
  });
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Página ${page} de ${pages}`, 285, 202, { align: "right" });
  }
  doc.save(reportName("pdf"));
}
