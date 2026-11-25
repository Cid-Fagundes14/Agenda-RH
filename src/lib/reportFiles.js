export function excelDateCell(date) {
  return date ? { value: new Date(`${date}T00:00:00Z`), format: "dd/mm/yyyy" } : null;
}

export async function saveReportWorkbook({ fileName, sheet, headers, widths, rows, autoFilter = false }) {
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const header = headers.map((value) => ({
    value, fontWeight: "bold", backgroundColor: "#284876", textColor: "#FFFFFF", wrap: true,
  }));
  const features = autoFilter ? [await createAutoFilter(headers.length, rows.length)] : [];

  await writeExcelFile([header, ...rows], {
    sheet,
    columns: widths.map((width) => ({ width })),
    stickyRowsCount: 1,
  }, { features }).toFile(fileName);
}

async function createAutoFilter(columnCount, rowCount) {
  const { getCellAddress, getOrderOfSiblings, insertElementMarkupAccordingToOrderOfSiblings } =
    await import("write-excel-file/utility");
  const worksheet = "xl/worksheets/sheet{id}.xml";
  const range = `A1:${getCellAddress(rowCount, columnCount - 1)}`;
  return {
    files: {
      transform: {
        [worksheet]: {
          transform: (xml) => insertElementMarkupAccordingToOrderOfSiblings(
            xml, `<autoFilter ref="${range}"/>`, getOrderOfSiblings(worksheet, "worksheet"), "worksheet",
          ),
        },
      },
    },
  };
}

export function addPdfPageNumbers(doc) {
  const pages = doc.getNumberOfPages();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Página ${page} de ${pages}`, width - 12, height - 8, { align: "right" });
  }
}
