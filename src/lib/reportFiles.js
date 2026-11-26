export function excelDateCell(date) {
  return date ? { value: new Date(`${date}T00:00:00Z`), format: "dd/mm/yyyy" } : null;
}

export async function saveReportWorkbook({ fileName, sheet, headers, widths, rows, autoFilter = false }) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const header = headers.map((value) => ({
    value, fontWeight: "bold", backgroundColor: "#284876", textColor: "#FFFFFF", wrap: true,
  }));
  const features = autoFilter ? [await createAutoFilter([{ columns: headers.length, rows: rows.length }])] : [];

  await writeExcelFile([header, ...rows], {
    sheet,
    columns: widths.map((width) => ({ width })),
    stickyRowsCount: 1,
  }, { features }).toFile(fileName);
}

export async function saveFilteredReportSheets(fileName, sheets) {
  const [{ default: writeExcelFile }, filter] = await Promise.all([
    import("write-excel-file/browser"),
    createAutoFilter(sheets.map(({ columns, data, stickyRowsCount }) => ({
      columns: columns.length,
      rows: data.length - stickyRowsCount,
      headerIndex: stickyRowsCount - 1,
    }))),
  ]);
  await writeExcelFile(sheets, { fontFamily: "Arial", fontSize: 10, features: [filter] }).toFile(fileName);
}

async function createAutoFilter(ranges) {
  const { getCellAddress, getOrderOfSiblings, insertElementMarkupAccordingToOrderOfSiblings } =
    await import("write-excel-file/utility");
  const worksheet = "xl/worksheets/sheet{id}.xml";
  return {
    files: {
      transform: {
        [worksheet]: {
          transform: (xml, _options, { sheetIndex }) => {
            const { columns, rows, headerIndex = 0 } = ranges[sheetIndex];
            const range = `A${headerIndex + 1}:${getCellAddress(headerIndex + rows, columns - 1)}`;
            return insertElementMarkupAccordingToOrderOfSiblings(
              xml, `<autoFilter ref="${range}"/>`, getOrderOfSiblings(worksheet, "worksheet"), "worksheet",
            );
          },
        },
      },
    },
  };
}

export function addPdfPageNumbers(doc, { margin = 12, bottom = 8, label, font = "helvetica" } = {}) {
  const pages = doc.getNumberOfPages();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont(font, "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    if (label) {
      doc.setDrawColor("#D8E1EC");
      doc.line(margin, height - bottom - 15, width - margin, height - bottom - 15);
      doc.text(label, margin, height - bottom);
    }
    doc.text(`Página ${page} de ${pages}`, width - margin, height - bottom, { align: "right" });
  }
}
