begin;

alter table public.tasks
  add column start_time time without time zone,
  add constraint tasks_start_time_valid check (
    start_time is null or (schedule_type in ('day', 'range') and start_time < time '24:00')
  );

grant insert (start_time), update (start_time) on public.tasks to authenticated;

create or replace function public.create_project_with_tasks(project_fields jsonb, task_fields jsonb)
returns public.projects
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_project public.projects;
begin
  insert into public.projects (name, notes, color, event_type, event_date, event_start, event_end)
  values (
    btrim(project_fields->>'name'),
    coalesce(project_fields->>'notes', ''),
    project_fields->>'color',
    project_fields->>'event_type',
    (project_fields->>'event_date')::date,
    (project_fields->>'event_start')::date,
    (project_fields->>'event_end')::date
  )
  returning * into created_project;

  insert into public.tasks (project_id, title, requester, notes, priority, stage, schedule_type, date, start_date, end_date, start_time)
  select created_project.id, btrim(draft.title), coalesce(draft.requester, ''), coalesce(draft.notes, ''),
    draft.priority, draft.stage, draft.schedule_type, draft.date, draft.start_date, draft.end_date, draft.start_time
  from jsonb_to_recordset(task_fields) as draft(
    title text, requester text, notes text, priority text, stage text,
    schedule_type text, date date, start_date date, end_date date, start_time time without time zone
  );

  return created_project;
end;
$$;

commit;
