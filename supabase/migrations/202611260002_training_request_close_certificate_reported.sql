begin;

alter table public.training_requests
  drop constraint training_request_close_valid,
  add constraint training_request_close_valid check (
    (status = 'finalizado' and certificate_issued is not null and completion_date is not null) or
    (status <> 'finalizado' and completion_date is null)
  );

commit;
