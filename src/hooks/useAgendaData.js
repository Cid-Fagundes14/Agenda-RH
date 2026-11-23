import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export function useAgendaData() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const [taskPage, projectPage] = await Promise.all([
        base44.entities.Task.list({ sort: "-created_date", limit: 500 }),
        base44.entities.Project.list({ sort: "-created_date", limit: 200 }),
      ]);
      setTasks(taskPage?.items ?? []);
      setProjects(projectPage?.items ?? []);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const offTasks = base44.entities.Task.subscribe(() => load());
    const offProjects = base44.entities.Project.subscribe(() => load());
    return () => {
      offTasks?.();
      offProjects?.();
    };
  }, [load]);

  const setStage = useCallback(
    async (task, stage) => {
      const previous = tasks;
      setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, stage } : item)));
      try {
        await base44.entities.Task.update(task.id, { stage });
        toast.success(stage === "finalizado" ? "Tarefa concluída." : "Etapa atualizada.");
      } catch (err) {
        setTasks(previous);
        toast.error("Não foi possível atualizar a tarefa. Tente novamente.");
      }
    },
    [tasks]
  );

  const toggleTask = useCallback(
    (task) => {
      const nextStage = task.stage === "finalizado" ? "em_andamento" : "finalizado";
      return setStage(task, nextStage);
    },
    [setStage]
  );

  const deleteTask = useCallback(
    async (task) => {
      try {
        await base44.entities.Task.delete(task.id);
        setTasks((prev) => prev.filter((item) => item.id !== task.id));
        toast.success("Tarefa excluída.");
      } catch (err) {
        toast.error("Não foi possível excluir a tarefa.");
        throw err;
      }
    },
    []
  );

  return { tasks, projects, loading, error, refresh: load, setStage, toggleTask, deleteTask };
}
