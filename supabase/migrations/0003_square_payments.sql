-- Square card payments for the academy enrolment form.
-- Run this once in the Supabase SQL editor, after 0002_enrolment_form.sql.

alter table public.enrolment_applications
  add column square_order_id   text check (length(square_order_id) <= 64),
  add column square_payment_id text check (length(square_payment_id) <= 64),
  add column paid_at           timestamptz;

create unique index enrolment_applications_square_order_idx
  on public.enrolment_applications (square_order_id)
  where square_order_id is not null;

-- Card payments are only ever marked as paid by the server (using the secret key)
-- after checking with Square, so the public insert rule must not let anyone set them.
drop policy "applications: anyone can submit" on public.enrolment_applications;
create policy "applications: anyone can submit" on public.enrolment_applications
  for insert to anon, authenticated
  with check (
    status = 'new'
    and payment_status = 'pending'
    and admin_notes is null
    and square_payment_id is null
    and paid_at is null
    and (user_id is null or user_id = auth.uid())
  );
