import { compareTaskStartTime, formatBR, taskIsOverdue, taskRange, taskStartTime } from "@/lib/dates";
import { addPdfPageNumbers, excelDateCell, saveReportWorkbook } from "@/lib/reportFiles";
import { PRIORITY_STYLES, SCHEDULE_OPTIONS } from "@/lib/taskConstants";

const HEADERS = [
  "Tarefa", "Projeto", "Solicitante", "Etapa", "Prioridade", "Atrasada",
  "Tipo de agendamento", "Data de início", "Hora de início", "Prazo", "Anotações",
];
const WIDTHS = [36, 25, 24, 20, 14, 13, 23, 18, 18, 16, 52];

function sortByDeadline(a, b) {
  if (a.range?.end !== b.range?.end) {
    if (!a.range) return 1;
    if (!b.range) return -1;
    return a.range.end.localeCompare(b.range.end);
  }
  return compareTaskStartTime(a.task, b.task) || a.task.title.localeCompare(b.task.title, "pt-BR");
}

function reportGroups(columns, projects, today) {
  return columns.map(({ label, items }) => ({
    label,
    rows: items.map((task) => ({
      task,
      project: task.project_id ? projects[task.project_id]?.name || "Projeto indisponível" : "Avulsa",
      range: taskRange(task),
      time: taskStartTime(task),
      priority: PRIORITY_STYLES[task.priority]?.label || "",
      overdue: taskIsOverdue(task, today),
    })).sort(sortByDeadline),
  }));
}

function excelTimeCell(time) {
  if (!time) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return { value: (hours * 60 + minutes) / 1440, format: "hh:mm" };
}

export async function exportTasksExcel(columns, projects, today) {
  const rows = reportGroups(columns, projects, today).flatMap(({ label, rows }) => rows.map(
    ({ task, project, range, time, priority, overdue }) => [
      task.title, project, task.requester, label, priority, overdue ? "Sim" : "Não",
      SCHEDULE_OPTIONS.find(({ value }) => value === task.schedule_type)?.label || "",
      excelDateCell(range?.start), excelTimeCell(time), excelDateCell(range?.end),
      task.notes ? { value: task.notes, wrap: true } : null,
    ],
  ));

  await saveReportWorkbook({
    fileName: `tarefas-${today}.xlsx`,
    sheet: "Tarefas",
    headers: HEADERS,
    widths: WIDTHS,
    rows,
    autoFilter: true,
  });
}

export async function exportTasksPdf(columns, projects, today, filters) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const groups = reportGroups(columns, projects, today);
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setProperties({ title: "Relatório de Tarefas" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(32, 55, 89);
  doc.setFontSize(17);
  doc.text("Relatório de Tarefas", 12, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const count = groups.reduce((total, group) => total + group.rows.length, 0);
  const unit = count === 1 ? "tarefa" : "tarefas";
  doc.text(`Emissão em ${formatBR(today)}  |  ${count} ${unit}`, 12, 22);
  const filterText = filters.length ? `Filtros: ${filters.join("  |  ")}` : "Filtros: todas as tarefas";
  const filterLines = doc.splitTextToSize(filterText, 273);
  doc.text(filterLines, 12, 28);
  const summaryY = 28 + 4 * filterLines.length + 2;
  doc.setFont("helvetica", "bold");
  doc.text(groups.map(({ label, rows }) => `${label}: ${rows.length}`).join("   |   "), 12, summaryY);

  let startY = summaryY + 4;
  const fields = ["Tarefa", "Projeto", "Solicitante", "Início", "Prazo", "Prioridade"];
  for (const { label, rows } of groups.filter(({ rows }) => rows.length)) {
    autoTable(doc, {
      startY,
      margin: { left: 12, right: 12, top: 13, bottom: 14 },
      head: [[{ content: `${label} · ${rows.length} ${rows.length === 1 ? "tarefa" : "tarefas"}`, colSpan: fields.length }], fields],
      body: rows.map(({ task, project, range, time, priority, overdue }) => [
        task.title, project, task.requester || "—",
        range ? `${formatBR(range.start)}${time ? ` às ${time}` : ""}` : "Sem data",
        range ? `${formatBR(range.end)}${overdue ? "\nAtrasada" : ""}` : "—",
        priority || "—",
      ]),
      styles: { font: "helvetica", fontSize: 9, cellPadding: 2.3, overflow: "linebreak", valign: "top" },
      headStyles: { fillColor: [40, 72, 118] },
      columnStyles: {
        0: { cellWidth: 85 }, 1: { cellWidth: 45 }, 2: { cellWidth: 45 },
        3: { cellWidth: 42 }, 4: { cellWidth: 32 }, 5: { cellWidth: 24 },
      },
      theme: "striped",
      rowPageBreak: "avoid",
    });
    startY = doc.lastAutoTable.finalY + 5;
  }

  addPdfPageNumbers(doc);
  doc.save(`tarefas-${today}.pdf`);
}
