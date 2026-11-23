import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteTask as removeTask, listProjects, listTasks, updateTaskStage } from "@/api/agenda";
import { useAuth } from "@/lib/AuthContext";

export function useAgendaData() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["agenda", user?.id];
  const query = useQuery({
    queryKey,
    refetchOnWindowFocus: true,
    enabled: !!user,
    queryFn: async () => {
      const [tasks, projects] = await Promise.all([listTasks(), listProjects()]);
      return { tasks, projects };
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey });
  async function setStage(task, stage) {
    try {
      await updateTaskStage(task.id, stage);
      await refresh();
      toast.success(stage === "finalizado" ? "Tarefa concluída." : "Etapa atualizada.");
    } catch {
      toast.error("Não foi possível atualizar a tarefa. Tente novamente.");
    }
  }

  const toggleTask = (task) => setStage(task, task.stage === "finalizado" ? "em_andamento" : "finalizado");

  async function deleteTask(task) {
    try {
      await removeTask(task.id);
      await refresh();
      toast.success("Tarefa excluída.");
    } catch (error) {
      toast.error("Não foi possível excluir a tarefa.");
      throw error;
    }
  }

  return {
    tasks: query.data?.tasks ?? [],
    projects: query.data?.projects ?? [],
    loading: query.isPending,
    error: query.error,
    refresh, setStage, toggleTask, deleteTask,
  };
}
