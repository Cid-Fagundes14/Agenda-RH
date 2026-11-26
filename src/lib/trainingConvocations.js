export const CONVOCATION_OPTIONS = [
  { value: "0", label: "Não convocados" },
  { value: "1", label: "1ª convocação" },
  { value: "2", label: "2ª convocação" },
];

export const ATTENDANCE_OPTIONS = [
  { value: "waiting", label: "Aguardando" },
  { value: "attended", label: "Compareceu" },
  { value: "absent", label: "Não compareceu" },
];

export function summarizeConvocations(request) {
  const attempts = request.convocations ?? [];
  const latest = attempts.at(-1);
  const open = request.status !== "finalizado";
  const needsRecall = open && attempts.length === 1 && latest.attendance === "absent";
  const twoAbsences = open && attempts.length === 2 && latest.attendance === "absent";
  const attendance = ATTENDANCE_OPTIONS.find(({ value }) => value === latest?.attendance)?.label;

  return {
    attempt: String(attempts.length),
    attendance: latest?.attendance,
    needsRecall,
    trainingDate: latest?.training_on || request.training_date,
    label: twoAbsences ? "2 faltas · Aguardando decisão" : needsRecall ? "A reconvocar"
      : latest ? `${attempts.length}ª convocação · ${attendance}` : "Não convocado",
  };
}
