import { removeParentAttachments } from "@/api/attachments";
import { getSupabase, resultOf } from "@/api/supabase";

function nullableFields(value, names) {
  return { ...value, ...Object.fromEntries(names.map((name) => [name, value[name] || null])) };
}

const taskFields = (task) => nullableFields(task, ["project_id", "date", "start_date", "end_date", "start_time"]);
const projectFields = (project) => nullableFields(project, ["event_date", "event_start", "event_end"]);

async function list(table, matches = {}) {
  const rows = [];
  let after;
  while (true) {
    const request = getSupabase().from(table).select("*").order("id").limit(500).match(matches);
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

export const listTrainingRequests = () => list("training_requests");
export const listTrainingDepartments = () => list("training_departments");
export const listTrainingTitles = () => list("training_titles");
export const saveTrainingRequest = (id, fields) => write("training_requests", id, fields);

export function saveTrainingConvocations(id, previous, convocations) {
  return resultOf(getSupabase().from("training_requests")
    .update({ convocations })
    .eq("id", id)
    .eq("convocations", JSON.stringify(previous))
    .select()
    .maybeSingle());
}

export async function deleteTask(id) {
  await removeParentAttachments("task", id);
  await resultOf(getSupabase().from("tasks").delete().eq("id", id).select("id").single());
}

export async function deleteProject(id, taskIds) {
  if (taskIds) {
    const linked = await list("tasks", { project_id: id });
    const expected = new Set(taskIds);
    if (linked.length !== expected.size || linked.some((task) => !expected.has(task.id))) {
      throw new Error("As tarefas vinculadas mudaram. Confira a lista e tente novamente.");
    }
    for (const task of linked) await removeParentAttachments("task", task.id);
  }

  await removeParentAttachments("project", id);
  await resultOf(getSupabase().rpc("delete_agenda_project", { target_id: id, task_ids: taskIds }));
}

export function createProjectWithTasks(project, tasks) {
  return resultOf(getSupabase().rpc("create_project_with_tasks", {
    project_fields: projectFields(project),
    task_fields: tasks.map((task) => {
      const { project_id, ...fields } = taskFields(task);
      return fields;
    }),
  }).single());
}
