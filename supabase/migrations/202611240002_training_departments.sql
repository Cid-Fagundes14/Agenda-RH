begin;

create table public.training_departments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_date timestamptz not null default now(),
  title text not null check (char_length(btrim(title)) between 1 and 160),
  unique (owner_id, title)
);

create unique index training_departments_normalized_idx
  on public.training_departments (owner_id, lower(title));

with existing as (
  select owner_id, id, created_date,
    nullif(btrim(regexp_replace(department, '[[:space:]]+', ' ', 'g')), '') as title
  from public.training_requests
)
insert into public.training_departments (owner_id, title)
select distinct on (owner_id, lower(title)) owner_id, title
from existing
where title is not null
order by owner_id, lower(title), created_date, id;

update public.training_requests as request
set department = catalog.title
from public.training_departments as catalog
where request.owner_id = catalog.owner_id
  and lower(btrim(regexp_replace(request.department, '[[:space:]]+', ' ', 'g'))) = lower(catalog.title)
  and request.department is distinct from catalog.title;

update public.training_requests
set department = null
where department ~ '^[[:space:]]*$';

alter table public.training_requests
  add constraint training_requests_department_fk
    foreign key (owner_id, department) references public.training_departments (owner_id, title);

alter table public.training_departments enable row level security;
revoke all on public.training_departments from public, anon, authenticated;
grant select on public.training_departments to authenticated;
grant insert (owner_id, title), update (title) on public.training_departments to authenticated;

create policy training_departments_owner_access on public.training_departments for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create function public.register_training_request_department()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.department := nullif(btrim(regexp_replace(new.department, '[[:space:]]+', ' ', 'g')), '');
  if new.department is not null then
    insert into public.training_departments as catalog (owner_id, title)
    values (new.owner_id, new.department)
    on conflict (owner_id, lower(title)) do update set title = catalog.title
    returning catalog.title into new.department;
  end if;
  return new;
end;
$$;

create trigger register_training_request_department
before insert or update of department on public.training_requests
for each row execute function public.register_training_request_department();

revoke all on function public.register_training_request_department() from public, anon;

commit;
