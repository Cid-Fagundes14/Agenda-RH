import { useState } from "react";
import { toast } from "sonner";
import { deleteTask } from "@/api/agenda";
import ResponsiveDialog from "@/components/ui-shared/ResponsiveDialog";
import { PRIORITY_STYLES, STAGE_STYLES } from "@/lib/taskConstants";
import { taskScheduleLabel } from "@/lib/dates";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function TaskDetailsDialog({ open, onOpenChange, task, project, onEdit, onToggle, onDeleted }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!task) return null;

  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.media;
  const stage = STAGE_STYLES[task.stage] || STAGE_STYLES.para_iniciar;
  const done = task.stage === "finalizado";

  const remove = async () => {
    setDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success("Tarefa excluída.");
      setConfirmOpen(false);
      onOpenChange(false);
      onDeleted?.(task);
    } catch (err) {
      toast.error("Não foi possível excluir a tarefa.");
    } finally {
      setDeleting(false);
    }
  };

  const footer = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onToggle?.(task)}
        className="min-h-11 rounded-md border border-border px-4 text-sm font-medium text-foreground transition hover:bg-secondary"
      >
        {done ? "Reabrir" : "Concluir"}
      </button>
      <button
        type="button"
        onClick={() => onEdit?.(task)}
        className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-[#1D4ED8]"
      >
        Editar
      </button>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        className="ml-auto min-h-11 rounded-md px-3 text-sm font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2]"
      >
        Excluir
      </button>
    </div>
  );

  return (
    <>
      <ResponsiveDialog open={open} onOpenChange={onOpenChange} title="Detalhes da tarefa" footer={footer}>
        <h3 className="font-heading text-xl font-semibold leading-snug text-foreground">{task.title}</h3>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full px-2 py-1 font-medium" style={{ backgroundColor: stage.bg, color: stage.color }}>
            {stage.label}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2 py-1 font-medium text-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: priority.color }} />
            {priority.label}
          </span>
          <span className="rounded-full bg-secondary px-2 py-1 font-medium text-foreground">{taskScheduleLabel(task)}</span>
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="meta-label">Projeto</dt>
            <dd className="mt-0.5 flex items-center gap-2 text-foreground">
              {project ? (
                <>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: project.color }} />
                  {project.name}
                </>
              ) : (
                <span className="text-muted-foreground">Tarefa avulsa</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="meta-label">Solicitante</dt>
            <dd className="mt-0.5 text-foreground">{task.requester || <span className="text-muted-foreground">Não informado</span>}</dd>
          </div>
          <div>
            <dt className="meta-label">Anotações</dt>
            <dd className="mt-0.5 whitespace-pre-line text-foreground">
              {task.notes || <span className="text-muted-foreground">Sem anotações</span>}
            </dd>
          </div>
        </dl>
      </ResponsiveDialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta tarefa?</AlertDialogTitle>
            <AlertDialogDescription>
              “{task.title}” será removida de todas as telas e do checklist do projeto. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                remove();
              }}
              disabled={deleting}
              className="min-h-11 bg-[#DC2626] text-white hover:bg-[#B91C1C]"
            >
              {deleting ? "Excluindo..." : "Excluir tarefa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
