begin;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  name text not null check (char_length(btrim(name)) between 1 and 160),
  notes text not null default '' check (char_length(notes) <= 4000),
  color text not null default '#2563EB' check (color ~ '^#[0-9a-fA-F]{6}$'),
  event_type text not null default 'none',
  event_date date,
  event_start date,
  event_end date,
  unique (id, owner_id),
  constraint projects_event_valid check (
    (event_type = 'none' and event_date is null and event_start is null and event_end is null) or
    (event_type = 'day' and event_date is not null and event_start is null and event_end is null) or
    (event_type = 'range' and event_date is null and event_start is not null and event_end is not null and event_end >= event_start)
  )
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  project_id uuid,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  requester text not null default '' check (char_length(requester) <= 160),
  notes text not null default '' check (char_length(notes) <= 4000),
  priority text not null default 'media' check (priority in ('baixa', 'media', 'alta')),
  stage text not null default 'para_iniciar' check (stage in ('para_iniciar', 'em_andamento', 'finalizado')),
  schedule_type text not null default 'none',
  date date,
  start_date date,
  end_date date,
  constraint tasks_project_owner foreign key (project_id, owner_id)
    references public.projects (id, owner_id) on delete set null (project_id),
  constraint tasks_schedule_valid check (
    (schedule_type = 'none' and date is null and start_date is null and end_date is null) or
    (schedule_type = 'day' and date is not null and start_date is null and end_date is null) or
    (schedule_type = 'range' and date is null and start_date is not null and end_date is not null and end_date >= start_date)
  )
);

create index projects_owner_id_idx on public.projects (owner_id, id);
create index tasks_owner_id_idx on public.tasks (owner_id, id);
create index tasks_project_owner_idx on public.tasks (project_id, owner_id);

alter table public.projects enable row level security;
alter table public.tasks enable row level security;

revoke all on public.projects, public.tasks from public, anon, authenticated;
grant select on public.projects, public.tasks to authenticated;
grant insert (name, notes, color, event_type, event_date, event_start, event_end),
  update (name, notes, color, event_type, event_date, event_start, event_end) on public.projects to authenticated;
grant insert (project_id, title, requester, notes, priority, stage, schedule_type, date, start_date, end_date),
  update (project_id, title, requester, notes, priority, stage, schedule_type, date, start_date, end_date),
  delete on public.tasks to authenticated;

create policy projects_owner_access on public.projects for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));
create policy tasks_owner_access on public.tasks for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create function public.create_project_with_tasks(project_fields jsonb, task_fields jsonb)
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

  insert into public.tasks (project_id, title, requester, notes, priority, stage, schedule_type, date, start_date, end_date)
  select created_project.id, btrim(draft.title), coalesce(draft.requester, ''), coalesce(draft.notes, ''),
    draft.priority, draft.stage, draft.schedule_type, draft.date, draft.start_date, draft.end_date
  from jsonb_to_recordset(task_fields) as draft(
    title text, requester text, notes text, priority text, stage text,
    schedule_type text, date date, start_date date, end_date date
  );

  return created_project;
end;
$$;

revoke all on function public.create_project_with_tasks(jsonb, jsonb) from public, anon;
grant execute on function public.create_project_with_tasks(jsonb, jsonb) to authenticated;

commit;
