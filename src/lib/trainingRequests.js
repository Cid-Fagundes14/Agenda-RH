export const TRAINING_STATUSES = [
  { value: "pendente", label: "Pendente" },
  { value: "tratativa", label: "Tratativa iniciada" },
  { value: "agendado", label: "Treinamento agendado" },
  { value: "finalizado", label: "Finalizado" },
];

export const TRAINING_URGENCIES = [
  { value: "critica", label: "Crítica", style: "bg-red-100 text-red-800" },
  { value: "alta", label: "Alta", style: "bg-orange-100 text-orange-800" },
  { value: "media", label: "Média", style: "bg-yellow-100 text-yellow-900" },
  { value: "baixa", label: "Baixa", style: "bg-emerald-100 text-emerald-800" },
];

export const TRAINING_TYPES = [
  { value: "obrigatorio", label: "Obrigatório (NR/legal)" },
  { value: "tecnico", label: "Técnico" },
  { value: "comportamental", label: "Comportamental" },
  { value: "lideranca", label: "Liderança" },
];

export const TRAINING_MODALITIES = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
  { value: "distancia", label: "À distância" },
];

const urgencyOrder = new Map(TRAINING_URGENCIES.map(({ value }, index) => [value, index]));

export function compareTrainingUrgency(a, b) {
  const rank = (request) => urgencyOrder.get(request.urgency) ?? TRAINING_URGENCIES.length;
  return rank(a) - rank(b);
}

export function trainingSearchKey(value) {
  return (value || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}
