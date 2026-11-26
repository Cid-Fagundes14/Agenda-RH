import { useState } from "react";
import { Download, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { downloadAttachment, removeAttachment } from "@/api/attachments";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

function fileSize(bytes) {
  if (bytes >= 1_000_000) return `${number.format(bytes / 1_000_000)} MB`;
  if (bytes >= 1_000) return `${number.format(bytes / 1_000)} KB`;
  return `${bytes} B`;
}

export default function AttachmentList({ query, disabled, exclude = [], emptyMessage = "Nenhum anexo salvo." }) {
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const files = (query.data || []).filter(({ id }) => !exclude.includes(id));

  async function download(file) {
    setDownloading(file.id);
    try {
      await downloadAttachment(file);
    } catch {
      toast.error("Não foi possível baixar o anexo.");
    } finally {
      setDownloading(null);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await removeAttachment(selected);
      setSelected(null);
      toast.success("Anexo excluído.");
    } catch {
      toast.error("Não foi possível concluir a exclusão. Tente novamente.");
    } finally {
      setDeleting(false);
      await query.refetch();
    }
  }

  if (query.isError) return (
    <p className="text-sm agenda-danger-text">
      Não foi possível carregar os anexos.{" "}
      <button type="button" className="underline" onClick={() => query.refetch()}>Tentar novamente</button>
    </p>
  );
  if (query.isPending) return <p className="text-sm text-muted-foreground">Carregando anexos...</p>;
  if (!files.length) return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;

  return (
    <>
      <ul className="divide-y rounded-md border">
        {files.map((file) => (
          <li key={file.id} className="flex items-center gap-2 p-2 text-sm">
            <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="break-all font-medium">{file.file_name}</p>
              <p className="text-xs text-muted-foreground">
                {fileSize(file.file_size)}{file.status !== "ready" ? " · " + (file.status === "pending" ? "Envio pendente" : "Exclusão pendente") : ""}
              </p>
            </div>
            <button type="button" aria-label={`Baixar ${file.file_name}`} title="Baixar"
              onClick={() => download(file)} disabled={disabled || !!downloading || file.status !== "ready"}
              className="grid size-10 shrink-0 place-items-center rounded-md hover:bg-secondary disabled:opacity-40">
              <Download className="size-4" />
            </button>
            <button type="button" aria-label={`Excluir anexo ${file.file_name}`} title="Excluir anexo"
              onClick={() => setSelected(file)} disabled={disabled || deleting}
              className="grid size-10 shrink-0 place-items-center rounded-md agenda-danger-text hover:bg-secondary disabled:opacity-40">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <AlertDialog open={!!selected} onOpenChange={(open) => { if (!open && !deleting) setSelected(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este anexo?</AlertDialogTitle>
            <AlertDialogDescription>“{selected?.file_name}” será apagado permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive hover:brightness-90"
              onClick={(event) => { event.preventDefault(); remove(); }}>
              {deleting ? "Excluindo..." : "Excluir anexo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
