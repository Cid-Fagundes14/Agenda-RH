import { useId, useState } from "react";
import { toast } from "sonner";
import { attachmentFileError, removeAttachment } from "@/api/attachments";
import AttachmentList from "@/components/attachments/AttachmentList";
import { useAttachments } from "@/hooks/useAttachments";

export default function AttachmentFields({ kind, parentId, drafts, setDrafts, disabled, open }) {
  const inputId = useId();
  const [errors, setErrors] = useState([]);
  const [removing, setRemoving] = useState(false);
  const query = useAttachments(kind, parentId, open);

  function addFiles(event) {
    const valid = [];
    const invalid = [];
    for (const file of event.target.files) {
      const reason = attachmentFileError(file);
      if (reason) invalid.push(`${file.name}: ${reason}`);
      else valid.push({ id: crypto.randomUUID(), file });
    }
    setDrafts((current) => [...current, ...valid]);
    setErrors(invalid);
    event.target.value = "";
  }

  async function discard(id) {
    setRemoving(true);
    try {
      if (parentId) await removeAttachment({ id });
      setDrafts((current) => current.filter((draft) => draft.id !== id));
      if (parentId) await query.refetch();
    } catch {
      toast.error("Não foi possível remover o anexo pendente. Tente novamente.");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <section className="mt-5 space-y-2 border-t pt-4">
      <label htmlFor={inputId} className="block text-sm font-semibold">Anexos</label>
      <p id={`${inputId}-help`} className="text-xs text-muted-foreground">PDF, XLS ou XLSX. Até 10 MB por arquivo.</p>
      <input id={inputId} type="file" multiple accept=".pdf,.xls,.xlsx"
        disabled={disabled || removing} onChange={addFiles} aria-describedby={`${inputId}-help`}
        className="block w-full min-w-0 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium disabled:opacity-60" />
      {errors.length ? (
        <ul role="alert" className="space-y-1 text-xs text-destructive">{errors.map((error, index) => <li key={index}>{error}</li>)}</ul>
      ) : null}
      {drafts.length ? (
        <ul className="divide-y rounded-md border">
          {drafts.map(({ id, file }) => (
            <li key={id} className="flex items-center justify-between gap-2 p-2 text-sm">
              <span className="break-all">{file.name}</span>
              <button type="button" disabled={disabled || removing} onClick={() => discard(id)}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-destructive hover:bg-secondary">
                Remover
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {parentId ? <AttachmentList query={query} disabled={disabled || removing} exclude={drafts.map(({ id }) => id)} /> : null}
    </section>
  );
}
