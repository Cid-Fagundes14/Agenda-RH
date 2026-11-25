import { getSupabase, resultOf } from "@/api/supabase";

export const MAX_ATTACHMENT_BYTES = 10_000_000;
const BUCKET = "agenda-anexos";
const FILE_TYPES = {
  pdf: "application/pdf",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const records = () => getSupabase().from("agenda_attachments");
const storage = () => getSupabase().storage.from(BUCKET);
const parentColumn = (kind) => kind === "task" ? "task_id" : "project_id";
const mimeType = (file) => FILE_TYPES[file.name.split(".").at(-1)?.toLowerCase()];

export function attachmentFileError(file) {
  if (!/\.(pdf|xls|xlsx)$/i.test(file.name)) return "Selecione um arquivo PDF, XLS ou XLSX.";
  if (file.name.length > 255) return "Use um nome de arquivo com até 255 caracteres.";
  if (file.size === 0) return "O arquivo está vazio.";
  if (file.size > MAX_ATTACHMENT_BYTES) return "O limite é de 10 MB por arquivo.";
  return "";
}

export async function listAttachments(kind, parentId) {
  const files = [];
  let last;
  while (true) {
    const query = records().select("*").eq(parentColumn(kind), parentId).order("id").limit(100);
    const page = await resultOf(last ? query.gt("id", last) : query);
    if (!page.length) return files.sort((a, b) => a.created_date.localeCompare(b.created_date));
    files.push(...page);
    last = page.at(-1).id;
  }
}

export async function uploadAttachment(kind, parentId, draft) {
  const { id, file } = draft;
  const invalid = attachmentFileError(file);
  if (invalid) throw new Error(invalid);
  const field = parentColumn(kind);
  await resultOf(records().upsert({
    id,
    [field]: parentId,
    file_name: file.name,
    file_size: file.size,
    mime_type: mimeType(file),
  }, { onConflict: "id", ignoreDuplicates: true }));

  const record = await resultOf(records().select("*").eq("id", id).eq(field, parentId).single());
  if (record.status === "ready") return;
  if (record.status !== "pending") throw new Error("O anexo está em exclusão.");

  const upload = await storage().upload(record.object_path, file.slice(0, file.size, record.mime_type), { contentType: record.mime_type });
  // Finalize even when the upload response was lost or a retry finds the object.
  const finalized = await records().update({ status: "ready" }).eq("id", id)
    .eq("status", "pending").select("id").single();
  if (finalized.error) throw upload.error || finalized.error;
}

export async function downloadAttachment(attachment) {
  const blob = await resultOf(storage().download(attachment.object_path));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.file_name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function removeAttachment(attachment) {
  const row = await resultOf(records().update({ status: "deleting" }).eq("id", attachment.id)
    .select("id, object_path").maybeSingle());
  if (!row) return;
  await resultOf(storage().remove([row.object_path]));
  await resultOf(records().delete().eq("id", row.id));
}

export async function removeParentAttachments(kind, id) {
  const files = await listAttachments(kind, id);
  for (const file of files) await removeAttachment(file);
}
