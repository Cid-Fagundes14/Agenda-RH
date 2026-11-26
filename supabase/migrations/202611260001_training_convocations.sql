begin;

-- Preserve prior training dates. An empty history means no recorded convocations.
create function public.training_convocations_valid(attempts jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
set datestyle = 'ISO, YMD'
as $$
declare
  attempt jsonb;
  invited_on date;
  training_on date;
begin
  if jsonb_typeof(attempts) <> 'array' then return false; end if;
  if jsonb_array_length(attempts) > 2 then return false; end if;
  if jsonb_array_length(attempts) = 2 and (attempts->0->>'attendance') is distinct from 'absent' then
    return false;
  end if;

  for attempt in select value from jsonb_array_elements(attempts) loop
    if jsonb_typeof(attempt) <> 'object' then return false; end if;
    if not (attempt ?& array['invited_on', 'training_on', 'attendance', 'note'])
       or (attempt - array['invited_on', 'training_on', 'attendance', 'note']) <> '{}'::jsonb
       or coalesce(attempt->>'invited_on', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
       or coalesce(attempt->>'training_on', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
       or coalesce(attempt->>'attendance', '') not in ('waiting', 'attended', 'absent')
       or jsonb_typeof(attempt->'note') <> 'string'
       or char_length(attempt->>'note') > 1000
       or (attempt->>'attendance' <> 'absent' and attempt->>'note' <> '')
    then
      return false;
    end if;
    invited_on := (attempt->>'invited_on')::date;
    training_on := (attempt->>'training_on')::date;
    if training_on < invited_on then return false; end if;
  end loop;
  return true;
exception
  when invalid_datetime_format or datetime_field_overflow then return false;
end;
$$;

revoke all on function public.training_convocations_valid(jsonb) from public, anon;
grant execute on function public.training_convocations_valid(jsonb) to authenticated;

alter table public.training_requests
  add column convocations jsonb not null default '[]'::jsonb,
  add constraint training_requests_convocations_valid check (public.training_convocations_valid(convocations)),
  add constraint training_requests_id_owner_key unique (id, owner_id);

grant update (convocations) on public.training_requests to authenticated;

-- Reuse the private bucket, its owner-only policies, and the file lifecycle.
alter table public.agenda_attachments
  add column training_request_id uuid,
  drop constraint agenda_attachments_check,
  add constraint agenda_attachments_one_parent
    check (num_nonnulls(task_id, project_id, training_request_id) = 1),
  add constraint agenda_attachments_training_certificate
    check (training_request_id is null or (
      mime_type = 'application/pdf' and lower(right(file_name, 4)) = '.pdf'
    )),
  add constraint agenda_attachments_training_request_fk
    foreign key (training_request_id, owner_id)
    references public.training_requests (id, owner_id) on delete restrict;

create unique index agenda_attachments_training_request_uidx
  on public.agenda_attachments (training_request_id)
  where training_request_id is not null;

grant insert (training_request_id) on public.agenda_attachments to authenticated;

commit;
