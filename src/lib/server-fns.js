import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  requester: z.string().max(160).optional().default(""),
  notes: z.string().max(4000).optional().default(""),
  priority: z.enum(["baixa", "media", "alta"]),
  stage: z.enum(["para_iniciar", "em_andamento", "finalizado"]),
  schedule_type: z.enum(["none", "day", "range"]),
  date: z.string().max(10).optional().default(""),
  start_date: z.string().max(10).optional().default(""),
  end_date: z.string().max(10).optional().default(""),
});

const projectSchema = z.object({
  name: z.string().min(1).max(160),
  notes: z.string().max(4000).optional().default(""),
  color: z.string().max(20),
  event_type: z.enum(["none", "day", "range"]),
  event_date: z.string().max(10).optional().default(""),
  event_start: z.string().max(10).optional().default(""),
  event_end: z.string().max(10).optional().default(""),
});

// Cria o projeto e o checklist em uma única operação. Se qualquer tarefa falhar,
// o projeto recém-criado é removido para não deixar registro parcial.
export const createProjectWithTasks = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      project: projectSchema,
      tasks: z.array(taskSchema).max(100).default([]),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const project = await base44.entities.Project.create(data.project);

    if (data.tasks.length === 0) {
      return { project, tasks: [] };
    }

    try {
      const tasks = await base44.entities.Task.bulkCreate(
        data.tasks.map((task) => ({ ...task, project_id: project.id }))
      );
      return { project, tasks };
    } catch (error) {
      await base44.entities.Task.deleteMany({ project_id: project.id }).catch(() => {});
      await base44.entities.Project.delete(project.id).catch(() => {});
      throw error;
    }
  });
