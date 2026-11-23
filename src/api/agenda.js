import { getSupabase, resultOf } from "@/api/supabase";

function nullableFields(value, names) {
  return { ...value, ...Object.fromEntries(names.map((name) => [name, value[name] || null])) };
}

const taskFields = (task) => nullableFields(task, ["project_id", "date", "start_date", "end_date", "start_time"]);
const projectFields = (project) => nullableFields(project, ["event_date", "event_start", "event_end"]);

async function list(table) {
  const rows = [];
  let after;
  while (true) {
    const request = getSupabase().from(table).select("*").order("id").limit(500);
    const page = await resultOf(after ? request.gt("id", after) : request);
    if (page.length === 0) return rows.sort((a, b) => b.created_date.localeCompare(a.created_date));
    rows.push(...page);
    after = page.at(-1).id;
  }
}

function write(table, id, value) {
  const query = getSupabase().from(table);
  const operation = id ? query.update(value).eq("id", id) : query.insert(value);
  return resultOf(operation.select().single());
}

export const listTasks = () => list("tasks");
export const listProjects = () => list("projects");
export const saveTask = (id, task) => write("tasks", id, taskFields(task));
export const updateTaskStage = (id, stage) => write("tasks", id, { stage });
export const updateProject = (id, project) => write("projects", id, projectFields(project));

export async function deleteTask(id) {
  await resultOf(getSupabase().from("tasks").delete().eq("id", id).select("id").single());
}

export function createProjectWithTasks(project, tasks) {
  return resultOf(getSupabase().rpc("create_project_with_tasks", {
    project_fields: projectFields(project),
    task_fields: tasks.map((task) => {
      const { project_id, ...fields } = taskFields(task);
      return fields;
    }),
  }));
}
