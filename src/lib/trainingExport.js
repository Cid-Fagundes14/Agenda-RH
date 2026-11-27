import regularFontUrl from "@/assets/fonts/LiberationSans-Regular.ttf?url";
import boldFontUrl from "@/assets/fonts/LiberationSans-Bold.ttf?url";
import { formatBR, todayISO } from "@/lib/dates";
import { addPdfPageNumbers, excelDateCell, saveFilteredReportSheets } from "@/lib/reportFiles";
import { ATTENDANCE_OPTIONS, CONVOCATION_OPTIONS, summarizeConvocations } from "@/lib/trainingConvocations";
import { TRAINING_STATUSES, TRAINING_URGENCIES } from "@/lib/trainingRequests";

const REPORT_TITLE = "Solicitações de Treinamento";
const HISTORY_TITLE = "Histórico de convocações";
const PDF_FONT = "LiberationSans";
const NAVY = "#24456F";
const MUTED = "#52657B";
const STRIPE = "#F3F6FA";
const NOT_INVITED = "Não convocado";
const ATTENDANCE_COLORS = {
  waiting: { textColor: "#825700", backgroundColor: "#FFF3D7" },
  attended: { textColor: "#20614B", backgroundColor: "#E9F5EE" },
  absent: { textColor: "#983944", backgroundColor: "#FBEDEF" },
};

const labelFor = (options, value) => options.find((item) => item.value === value)?.label || "";
const attemptLabel = (count) => labelFor(CONVOCATION_OPTIONS, String(count));
const certificateLabel = (value) => value == null ? "Não informado" : value ? "Sim" : "Não";
const reportName = (extension) => `solicitacoes-treinamento-${todayISO()}.${extension}`;

function reportDescription(requests, filters) {
  const count = requests.length;
  return [
    formatBR(todayISO()),
    `${count} ${count === 1 ? "solicitação" : "solicitações"}`,
    ...(filters.length ? filters : ["Sem filtros"]),
  ].join(" · ");
}

function reportRows(requests) {
  return requests.map((request) => {
    const attempts = request.convocations ?? [];
    const { trainingDate } = summarizeConvocations(request);
    return {
      request, attempts, trainingDate,
      latest: attempts.at(-1),
      status: labelFor(TRAINING_STATUSES, request.status),
      urgency: labelFor(TRAINING_URGENCIES, request.urgency),
      certificate: certificateLabel(request.certificate_issued),
    };
  });
}

function attendanceCell(value) {
  return value ? {
    value: labelFor(ATTENDANCE_OPTIONS, value),
    fontWeight: "bold",
    ...ATTENDANCE_COLORS[value],
  } : null;
}

function reportSheet(sheet, title, description, headers, widths, rows) {
  return {
    sheet,
    showGridLines: false,
    stickyRowsCount: 4,
    columns: widths.map((width) => ({ width })),
    data: [
      [{ value: title, fontSize: 16, fontWeight: "bold", textColor: NAVY, height: 31 }],
      [{ value: description, textColor: MUTED, height: 22 }],
      [{ value: "", height: 10 }],
      headers.map((value) => ({
        value, fontWeight: "bold", backgroundColor: NAVY, textColor: "#FFFFFF", wrap: true, height: 30,
      })),
      ...rows.map((row, index) => row.map((cell) => ({
        backgroundColor: index % 2 ? STRIPE : "#FFFFFF",
        alignVertical: "center",
        wrap: true,
        ...(cell && typeof cell === "object" ? cell : { value: cell ?? "" }),
      }))),
    ],
  };
}

export async function exportTrainingExcel(requests, filters = []) {
  const records = reportRows(requests);
  const summary = records.map(({ request, attempts, latest, trainingDate, status, urgency, certificate }) => [
    request.employee_name, request.registration, request.employee_role, request.department,
    request.requester, request.immediate_manager, request.training_title,
    status, urgency, excelDateCell(request.expected_completion_date),
    latest ? attemptLabel(attempts.length) : NOT_INVITED,
    excelDateCell(latest?.invited_on), excelDateCell(trainingDate), attendanceCell(latest?.attendance),
    certificate,
  ]);
  const history = records.flatMap(({ request, attempts }) => attempts.map((attempt, index) => [
    request.employee_name, request.registration, request.training_title, attemptLabel(index + 1),
    excelDateCell(attempt.invited_on), excelDateCell(attempt.training_on),
    attendanceCell(attempt.attendance), attempt.note,
  ]));

  await saveFilteredReportSheets(reportName("xlsx"), [
    reportSheet("Solicitações", REPORT_TITLE, reportDescription(requests, filters), [
      "Colaborador", "Matrícula", "Função", "Departamento / Área", "Solicitante", "Gestor imediato",
      "Treinamento", "Status da solicitação", "Urgência", "Prazo previsto", "Última convocação",
      "Data da convocação", "Data do treinamento", "Comparecimento", "Certificado",
    ], [22, 12, 24, 21, 25, 25, 31, 22, 11, 16, 20, 20, 21, 19, 16], summary),
    reportSheet(HISTORY_TITLE, HISTORY_TITLE,
      `${history.length} ${history.length === 1 ? "tentativa registrada" : "tentativas registradas"}`, [
        "Colaborador", "Matrícula", "Treinamento", "Convocação", "Data da convocação",
        "Data do treinamento", "Comparecimento", "Observação da falta",
      ], [22, 12, 31, 19, 20, 21, 19, 35], history),
  ]);
}

function pdfConvocation({ latest, attempts, trainingDate }) {
  if (!latest) {
    return [NOT_INVITED, ...(trainingDate ? [`Treinamento previsto em ${formatBR(trainingDate)}`] : [])];
  }
  return [
    `${attemptLabel(attempts.length)} · ${labelFor(ATTENDANCE_OPTIONS, latest.attendance)}`,
    `Convocado em ${formatBR(latest.invited_on)}`,
    `Treinamento em ${formatBR(trainingDate)}`,
  ];
}

async function readFont(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Não foi possível carregar a fonte do relatório.");
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function exportTrainingPdf(requests, filters = []) {
  const [{ jsPDF }, { autoTable }, regular, bold] = await Promise.all([
    import("jspdf"), import("jspdf-autotable"), readFont(regularFontUrl), readFont(boldFontUrl),
  ]);
  const records = reportRows(requests);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4", putOnlyUsedFonts: true, compress: true });
  for (const [style, data] of [["normal", regular], ["bold", bold]]) {
    const name = `${PDF_FONT}-${style}.ttf`;
    doc.addFileToVFS(name, data);
    doc.addFont(name, PDF_FONT, style);
  }
  const width = doc.internal.pageSize.getWidth();
  const margin = 43;
  doc.setProperties({ title: REPORT_TITLE });
  doc.setFont(PDF_FONT, "bold");
  doc.setTextColor(NAVY);
  doc.setFontSize(23);
  doc.text(REPORT_TITLE, margin, 61);
  doc.setFont(PDF_FONT, "normal");
  doc.setTextColor(MUTED);
  doc.setFontSize(10);
  const details = doc.splitTextToSize(reportDescription(requests, filters), width - margin * 2);
  doc.text(details, margin, 82);
  const columnWidths = [108, 110, 67, 86, 73, 49, 58, 147, 56];
  autoTable(doc, {
    startY: 103 + (details.length - 1) * 12,
    margin: { left: margin, right: margin, top: 38, bottom: 68 },
    head: [[
      "Colaborador", "Solicitante e gestor", "Departamento / Área", "Treinamento", "Status da solicitação",
      "Urgência", "Prazo previsto", "Convocação e comparecimento", "Certificado",
    ]],
    body: records.map((record) => {
      const { request, status, urgency, certificate } = record;
      const employee = [
        request.employee_name,
        request.registration && `Matrícula: ${request.registration}`,
        request.employee_role && `Função: ${request.employee_role}`,
      ].filter(Boolean).join("\n");
      const contacts = [
        request.requester && `Solicitante: ${request.requester}`,
        request.immediate_manager && `Gestor imediato: ${request.immediate_manager}`,
      ].filter(Boolean).join("\n");
      return [
        employee, contacts, request.department, request.training_title,
        status, urgency, formatBR(request.expected_completion_date), pdfConvocation(record), certificate,
      ].map((value) => value || "-");
    }),
    styles: {
      font: PDF_FONT, fontSize: 9, textColor: "#14283E",
      cellPadding: { top: 11, bottom: 11, left: 6, right: 6 }, overflow: "linebreak",
    },
    headStyles: { fillColor: NAVY, textColor: "#FFFFFF", fontSize: 8.3 },
    didParseCell({ section, row, cell }) {
      if (section === "body") cell.styles.fillColor = row.index % 2 ? STRIPE : "#FFFFFF";
    },
    columnStyles: Object.fromEntries(columnWidths.map((cellWidth, index) => [index, {
      cellWidth,
      ...(index === 0 ? { fontStyle: "bold" } : {}),
      ...(index === 7 ? { fontSize: 8.7, textColor: MUTED } : {}),
    }])),
    theme: "striped",
    rowPageBreak: "avoid",
    willDrawCell({ section, column, cell }) {
      if (section === "body" && column.index === 7) {
        // Keep the first line for custom coloring after the table draws the cell background.
        cell.text = [];
      }
    },
    didDrawCell({ section, column, row, cell }) {
      if (section !== "body") return;
      doc.setDrawColor("#D8E1EC");
      doc.setLineWidth(0.5);
      doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
      if (column.index !== 7) return;
      const record = records[row.index];
      const [heading, ...dates] = pdfConvocation(record);
      const [attempt, attendance] = heading.split(" · ");
      const x = cell.x + cell.padding("left");
      const y = cell.y + cell.padding("top") + 8;
      doc.setFontSize(8.7);
      doc.setFont(PDF_FONT, "bold");
      doc.setTextColor("#14283E");
      doc.text(attempt, x, y);
      const headingWidth = doc.getTextWidth(attempt);
      doc.setFont(PDF_FONT, "normal");
      if (attendance) {
        doc.setTextColor(ATTENDANCE_COLORS[record.latest.attendance]?.textColor ?? MUTED);
        doc.text(` · ${attendance}`, x + headingWidth, y);
      }
      doc.setTextColor(MUTED);
      dates.forEach((date, index) => doc.text(date, x, y + (index + 1) * 12));
    },
  });
  const note = "O relatório exibe a última convocação de cada solicitação. O histórico completo fica na planilha.";
  const noteY = doc.lastAutoTable.finalY + 18;
  doc.setFont(PDF_FONT, "normal");
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text(note, margin, noteY);
  addPdfPageNumbers(doc, { margin: 37, bottom: 29, label: "Agenda RH", font: PDF_FONT });
  doc.save(reportName("pdf"));
}
