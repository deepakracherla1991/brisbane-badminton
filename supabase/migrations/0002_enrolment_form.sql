-- Academy enrolment form (replaces the Google Form).
-- Run this once in the Supabase SQL editor, after 0001_academy_portal.sql.
--
-- Anyone can submit an enrolment (no account needed). Only admins can read
-- or change them. Payment receipts are stored in a private storage bucket.

create table public.enrolment_applications (
  id                 uuid primary key default gen_random_uuid(),
  reference          text not null unique check (reference ~ '^BB-[A-Z0-9]{2,6}-[A-Z0-9]{5}$'),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  user_id            uuid references public.profiles (id) on delete set null,

  term               text not null check (length(term) <= 40),
  program            text not null check (program in ('kids', 'advanced', 'trial')),
  plan               text check (length(plan) <= 40),
  sessions           text[] not null default '{}' check (cardinality(sessions) <= 12),
  invited_by_coach   boolean,

  player_name        text not null check (length(btrim(player_name)) between 1 and 120),
  date_of_birth      date not null,
  gender             text check (length(gender) <= 40),
  level              text not null check (length(level) <= 40),
  experience         text not null check (length(experience) <= 60),
  medical            text not null check (length(btrim(medical)) between 1 and 1000),
  heard_from         text check (length(heard_from) <= 60),

  parent_name        text not null check (length(btrim(parent_name)) between 1 and 120),
  mobile             text not null check (length(mobile) between 8 and 30),
  email              text not null check (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' and length(email) <= 254),
  emergency_contact  text not null check (length(btrim(emergency_contact)) between 1 and 160),
  suburb             text not null check (length(btrim(suburb)) between 1 and 80),

  sibling_order      smallint not null default 1 check (sibling_order between 1 and 3),
  price_cents        integer check (price_cents >= 0),
  discount_cents     integer not null default 0 check (discount_cents >= 0),
  total_cents        integer check (total_cents >= 0),

  payment_method     text not null check (payment_method in ('bank', 'playon', 'playon-bank', 'card')),
  playon_voucher     text check (length(playon_voucher) <= 60),
  files              text[] not null default '{}' check (cardinality(files) <= 5),

  status             text not null default 'new' check (status in ('new', 'confirmed', 'waitlisted', 'declined', 'cancelled')),
  payment_status     text not null default 'pending' check (payment_status in ('pending', 'verified', 'refunded')),
  admin_notes        text check (length(admin_notes) <= 2000)
);

create index enrolment_applications_created_idx on public.enrolment_applications (created_at desc);
create index enrolment_applications_status_idx on public.enrolment_applications (status, term);
create index enrolment_applications_user_idx on public.enrolment_applications (user_id);

create trigger enrolment_applications_touch
  before update on public.enrolment_applications
  for each row execute function public.touch_updated_at();

alter table public.enrolment_applications enable row level security;

-- Anyone may submit. New submissions can't set staff-only fields or claim someone else's account.
create policy "applications: anyone can submit" on public.enrolment_applications
  for insert to anon, authenticated
  with check (
    status = 'new'
    and payment_status = 'pending'
    and admin_notes is null
    and (user_id is null or user_id = auth.uid())
  );

-- Signed-in parents can see their own submissions; admins see all.
create policy "applications: owner or admin read" on public.enrolment_applications
  for select to authenticated
  using (public.is_admin() or (user_id is not null and user_id = auth.uid()));

create policy "applications: admin update" on public.enrolment_applications
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "applications: admin delete" on public.enrolment_applications
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Private storage for payment receipts / PlayOn vouchers
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'enrolment-uploads',
  'enrolment-uploads',
  false,
  10485760, -- 10 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do nothing;

-- Anyone can upload into applications/<random id>/..., but nobody except admins can list or read files.
create policy "enrolment uploads: anyone can upload" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'enrolment-uploads' and (storage.foldername(name))[1] = 'applications');

create policy "enrolment uploads: admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'enrolment-uploads' and public.is_admin());

create policy "enrolment uploads: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'enrolment-uploads' and public.is_admin());
