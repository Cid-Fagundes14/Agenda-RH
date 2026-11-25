begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('agenda-anexos', 'agenda-anexos', false, 10000000, array[
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

alter table public.tasks add constraint tasks_id_owner_key unique (id, owner_id);

create table public.agenda_attachments (
  id uuid primary key,
  owner_id uuid not null default auth.uid(),
  task_id uuid,
  project_id uuid,
  object_path text generated always as (owner_id::text || '/' || id::text) stored unique,
  file_name text not null check (length(btrim(file_name)) between 1 and 255),
  file_size bigint not null check (file_size between 1 and 10000000),
  mime_type text not null check (mime_type in (
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  )),
  status text not null default 'pending' check (status in ('pending', 'ready', 'deleting')),
  created_date timestamptz not null default now(),
  check (num_nonnulls(task_id, project_id) = 1),
  foreign key (task_id, owner_id) references public.tasks (id, owner_id) on delete restrict,
  foreign key (project_id, owner_id) references public.projects (id, owner_id) on delete restrict
);

create index agenda_attachments_task_idx on public.agenda_attachments (task_id, owner_id);
create index agenda_attachments_project_idx on public.agenda_attachments (project_id, owner_id);

alter table public.agenda_attachments enable row level security;
revoke all on public.agenda_attachments from public, anon, authenticated;
grant select, delete on public.agenda_attachments to authenticated;
grant insert (id, task_id, project_id, file_name, file_size, mime_type),
  update (status) on public.agenda_attachments to authenticated;

create policy agenda_attachment_owner on public.agenda_attachments
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Hold the reservation while Storage inserts the object metadata, so marking it
-- for deletion cannot race with finalizing an upload.
create function public.agenda_attachment_can_upload(path text)
returns boolean
language sql
set search_path = ''
as $$
  select exists (
    select 1 from public.agenda_attachments
    where object_path = path and owner_id = (select auth.uid()) and status = 'pending'
    for share
  );
$$;

revoke all on function public.agenda_attachment_can_upload(text) from public, anon;
grant execute on function public.agenda_attachment_can_upload(text) to authenticated;

create policy agenda_attachment_objects_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'agenda-anexos' and public.agenda_attachment_can_upload(name));

create policy agenda_attachment_objects_read on storage.objects
  for select to authenticated
  using (bucket_id = 'agenda-anexos' and exists (
    select 1 from public.agenda_attachments as attachment
    where attachment.object_path = name and attachment.owner_id = (select auth.uid())
  ));

create policy agenda_attachment_objects_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'agenda-anexos' and exists (
    select 1 from public.agenda_attachments as attachment
    where attachment.object_path = name and attachment.owner_id = (select auth.uid())
      and attachment.status = 'deleting'
  ));

-- Read Storage metadata only. Supabase's Storage API handles physical deletion.
create function public.guard_agenda_attachment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.status <> 'deleting' or exists (
      select 1 from storage.objects
      where bucket_id = 'agenda-anexos' and name = old.object_path
    ) then
      raise exception 'Remova o arquivo do Storage antes de apagar o anexo.';
    end if;
    return old;
  end if;

  if new.status = old.status or new.status = 'deleting' then
    return new;
  end if;

  if old.status = 'pending' and new.status = 'ready' and exists (
    select 1 from storage.objects
    where bucket_id = 'agenda-anexos' and name = old.object_path
  ) then
    return new;
  end if;

  raise exception 'Não foi possível atualizar o estado do anexo.';
end;
$$;

revoke all on function public.guard_agenda_attachment() from public, anon, authenticated;

create trigger agenda_attachment_lifecycle
before update of status or delete on public.agenda_attachments
for each row execute function public.guard_agenda_attachment();

grant delete on public.projects to authenticated;

create function public.delete_agenda_project(target_id uuid, task_ids uuid[] default null)
returns void
language plpgsql
set search_path = ''
as $$
declare
  current_ids uuid[];
begin
  perform 1 from public.projects
    where id = target_id and owner_id = (select auth.uid())
    for update;
  if not found then
    raise exception 'Evento não encontrado.';
  end if;
  if task_ids is not null then
    select coalesce(array_agg(id order by id), '{}'::uuid[]) into current_ids
    from (
      select id from public.tasks where project_id = target_id for update
    ) as linked;
    if current_ids <> array(select unnest(task_ids) order by 1) then
      raise exception 'As tarefas vinculadas mudaram. Atualize a página e confira antes de excluir.';
    end if;
    delete from public.tasks where project_id = target_id;
  end if;
  delete from public.projects where id = target_id;
end;
$$;

revoke all on function public.delete_agenda_project(uuid, uuid[]) from public, anon;
grant execute on function public.delete_agenda_project(uuid, uuid[]) to authenticated;

commit;
