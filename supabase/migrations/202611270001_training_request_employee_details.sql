begin;

alter table public.training_requests
  add column employee_role text check (char_length(employee_role) <= 160),
  add column immediate_manager text check (char_length(immediate_manager) <= 160);

grant insert (employee_role, immediate_manager),
  update (employee_role, immediate_manager)
  on public.training_requests to authenticated;

commit;
