begin;

create table public.training_titles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  unique (owner_id, title)
);

create unique index training_titles_normalized_idx
  on public.training_titles (owner_id, lower(title));

create table public.training_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  employee_name text not null check (char_length(btrim(employee_name)) between 1 and 160),
  registration text check (char_length(registration) <= 80),
  department text check (char_length(department) <= 160),
  requester text check (char_length(requester) <= 160),
  training_title text not null,
  training_type text check (training_type in ('obrigatorio', 'tecnico', 'comportamental', 'lideranca')),
  modality text check (modality in ('presencial', 'online', 'distancia')),
  location text check (char_length(location) <= 200),
  duration_hours numeric(9,2) check (duration_hours > 0 and duration_hours < 10000000),
  requested_date date,
  status text not null default 'pendente'
    check (status in ('pendente', 'tratativa', 'agendado', 'finalizado')),
  expected_completion_date date,
  training_date date,
  completion_date date,
  facilitator text check (char_length(facilitator) <= 160),
  estimated_cost numeric(12,2) check (estimated_cost >= 0 and estimated_cost < 10000000000),
  actual_cost numeric(12,2) check (actual_cost >= 0 and actual_cost < 10000000000),
  certificate_issued boolean,
  urgency text check (urgency in ('baixa', 'media', 'alta', 'critica')),
  notes text check (char_length(notes) <= 4000),
  foreign key (owner_id, training_title) references public.training_titles (owner_id, title) on delete no action,
  constraint training_request_close_valid check (
    (status = 'finalizado' and certificate_issued is true and completion_date is not null) or
    (status <> 'finalizado' and completion_date is null)
  )
);

create index training_requests_owner_id_idx on public.training_requests (owner_id, id);
create index training_requests_title_idx on public.training_requests (owner_id, training_title);

alter table public.training_titles enable row level security;
alter table public.training_requests enable row level security;

revoke all on public.training_titles, public.training_requests from public, anon, authenticated;
grant select on public.training_titles, public.training_requests to authenticated;
grant insert (title), update (title) on public.training_titles to authenticated;
grant insert (
  employee_name, registration, department, requester, training_title, training_type,
  modality, location, duration_hours, requested_date, status, expected_completion_date,
  training_date, completion_date, facilitator, estimated_cost, actual_cost,
  certificate_issued, urgency, notes
), update (
  employee_name, registration, department, requester, training_title, training_type,
  modality, location, duration_hours, requested_date, status, expected_completion_date,
  training_date, completion_date, facilitator, estimated_cost, actual_cost,
  certificate_issued, urgency, notes
) on public.training_requests to authenticated;

create policy training_titles_owner_access on public.training_titles for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy training_requests_owner_access on public.training_requests for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create function public.register_training_request_title()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.training_titles as catalog (title)
  values (btrim(regexp_replace(new.training_title, '[[:space:]]+', ' ', 'g')))
  on conflict (owner_id, lower(title)) do update set title = catalog.title
  returning catalog.title into new.training_title;

  return new;
end;
$$;

create trigger register_training_request_title
before insert or update of training_title on public.training_requests
for each row execute function public.register_training_request_title();

revoke all on function public.register_training_request_title() from public, anon;

commit;
