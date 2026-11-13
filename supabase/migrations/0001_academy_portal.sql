-- Brisbane Badminton academy portal
-- Run this once in the Supabase SQL editor (or with `supabase db push`).
--
-- Tables:   profiles, students, terms, classes, enrolments
-- Security: row level security on every table; enrolment changes go through
--           the security-definer functions below so capacity and waitlists stay correct.

-- ---------------------------------------------------------------------------
-- Profiles (one per auth user)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now()
);

-- Create a profile automatically when someone signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    left(new.raw_user_meta_data ->> 'phone', 30)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep the profile email in sync if the user changes it.
create function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------------
-- Students (a parent account can have several)
-- ---------------------------------------------------------------------------
create table public.students (
  id             uuid primary key default gen_random_uuid(),
  owner_id       uuid not null references public.profiles (id) on delete cascade,
  full_name      text not null check (length(btrim(full_name)) between 1 and 120),
  date_of_birth  date,
  notes          text check (notes is null or length(notes) <= 1000),
  created_at     timestamptz not null default now()
);
create index students_owner_idx on public.students (owner_id);

-- ---------------------------------------------------------------------------
-- Terms and classes
-- ---------------------------------------------------------------------------
create table public.terms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(btrim(name)) between 1 and 80),
  starts_on   date not null,
  ends_on     date not null,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create table public.classes (
  id            uuid primary key default gen_random_uuid(),
  term_id       uuid not null references public.terms (id) on delete cascade,
  program       text not null,
  name          text not null check (length(btrim(name)) between 1 and 120),
  level         text,
  description   text,
  day_of_week   smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday
  start_time    time not null,
  end_time      time not null,
  coach         text,
  capacity      integer not null check (capacity > 0),
  price_cents   integer not null default 0 check (price_cents >= 0),
  sessions      integer not null default 10 check (sessions > 0),
  min_age       integer check (min_age is null or min_age >= 0),
  max_age       integer check (max_age is null or max_age >= 0),
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  check (end_time > start_time)
);
create index classes_term_idx on public.classes (term_id);

-- ---------------------------------------------------------------------------
-- Enrolments
-- ---------------------------------------------------------------------------
create table public.enrolments (
  id              uuid primary key default gen_random_uuid(),
  class_id        uuid not null references public.classes (id) on delete cascade,
  student_id      uuid not null references public.students (id) on delete cascade,
  status          text not null default 'enrolled' check (status in ('enrolled', 'waitlisted', 'withdrawn')),
  payment_status  text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'waived')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
-- A student can only hold one active (enrolled or waitlisted) place per class.
create unique index enrolments_active_unique
  on public.enrolments (class_id, student_id)
  where status <> 'withdrawn';
create index enrolments_class_idx on public.enrolments (class_id, status, created_at);
create index enrolments_student_idx on public.enrolments (student_id);

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger enrolments_touch
  before update on public.enrolments
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles   enable row level security;
alter table public.students   enable row level security;
alter table public.terms      enable row level security;
alter table public.classes    enable row level security;
alter table public.enrolments enable row level security;

-- Profiles: users see and edit their own; admins see everyone.
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- Users may only change their name and phone (never their role or email).
revoke update on public.profiles from authenticated, anon;
grant update (full_name, phone) on public.profiles to authenticated;

-- Students: owners manage their own; admins can read all.
create policy "students: owner read" on public.students
  for select to authenticated using (owner_id = auth.uid() or public.is_admin());
create policy "students: owner insert" on public.students
  for insert to authenticated with check (owner_id = auth.uid());
create policy "students: owner update" on public.students
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "students: owner delete" on public.students
  for delete to authenticated using (owner_id = auth.uid());

-- Terms and classes: anyone can browse published classes; admins manage.
create policy "terms: public read" on public.terms
  for select to anon, authenticated using (true);
create policy "terms: admin write" on public.terms
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "classes: public read published" on public.classes
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "classes: admin write" on public.classes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Enrolments: owners read their own; changes go through functions; admins manage.
create policy "enrolments: owner read" on public.enrolments
  for select to authenticated using (
    public.is_admin()
    or exists (select 1 from public.students s where s.id = student_id and s.owner_id = auth.uid())
  );
create policy "enrolments: admin update" on public.enrolments
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "enrolments: admin delete" on public.enrolments
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Functions
-- ---------------------------------------------------------------------------

-- Spots taken per published class (counts only, no personal data).
create function public.class_availability()
returns table (class_id uuid, enrolled integer, waitlisted integer)
language sql
stable
security definer
set search_path = public
as $$
  select c.id,
         count(e.id) filter (where e.status = 'enrolled')::int,
         count(e.id) filter (where e.status = 'waitlisted')::int
  from public.classes c
  left join public.enrolments e on e.class_id = c.id
  where c.is_published or public.is_admin()
  group by c.id;
$$;

-- Fill free places from the waitlist, oldest first. Caller must hold the class row lock.
-- Returns who was promoted so the app can email them.
create function public._promote_waitlist(p_class_id uuid)
returns table (enrolment_id uuid, email text, student_name text, class_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity int;
  v_enrolled int;
  v_next uuid;
begin
  select capacity into v_capacity from public.classes where id = p_class_id;
  loop
    select count(*) into v_enrolled from public.enrolments where class_id = p_class_id and status = 'enrolled';
    exit when v_enrolled >= v_capacity;
    select id into v_next from public.enrolments
      where class_id = p_class_id and status = 'waitlisted'
      order by created_at, id
      limit 1
      for update;
    exit when v_next is null;
    update public.enrolments set status = 'enrolled' where id = v_next;
    return query
      select e.id, p.email, s.full_name, c.name
      from public.enrolments e
      join public.students s on s.id = e.student_id
      join public.profiles p on p.id = s.owner_id
      join public.classes c on c.id = e.class_id
      where e.id = v_next;
    v_next := null;
  end loop;
end;
$$;

-- Enrol one of your students. Becomes 'waitlisted' if the class is full.
create function public.enrol_student(p_class_id uuid, p_student_id uuid)
returns public.enrolments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class public.classes;
  v_enrolled int;
  v_row public.enrolments;
begin
  if auth.uid() is null then
    raise exception 'Please sign in to enrol.' using errcode = '28000';
  end if;
  if not exists (select 1 from public.students where id = p_student_id and owner_id = auth.uid()) then
    raise exception 'Student not found.' using errcode = 'P0002';
  end if;

  -- Lock the class so two people can't take the last place at once.
  select * into v_class from public.classes where id = p_class_id and is_published for update;
  if not found then
    raise exception 'Class not found.' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.terms t where t.id = v_class.term_id and t.ends_on < current_date) then
    raise exception 'This term has finished.' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.enrolments
    where class_id = p_class_id and student_id = p_student_id and status <> 'withdrawn'
  ) then
    raise exception 'This student is already enrolled or on the waitlist for this class.' using errcode = '23505';
  end if;

  select count(*) into v_enrolled from public.enrolments where class_id = p_class_id and status = 'enrolled';

  insert into public.enrolments (class_id, student_id, status)
  values (p_class_id, p_student_id, case when v_enrolled < v_class.capacity then 'enrolled' else 'waitlisted' end)
  returning * into v_row;
  return v_row;
end;
$$;

-- Withdraw an enrolment (owner or admin). Frees the place for the next person on the waitlist.
create function public.withdraw_enrolment(p_enrolment_id uuid)
returns table (enrolment_id uuid, email text, student_name text, class_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.enrolments;
begin
  if auth.uid() is null then
    raise exception 'Please sign in.' using errcode = '28000';
  end if;

  select e.* into v_row from public.enrolments e
  join public.students s on s.id = e.student_id
  where e.id = p_enrolment_id and (s.owner_id = auth.uid() or public.is_admin());
  if not found then
    raise exception 'Enrolment not found.' using errcode = 'P0002';
  end if;

  perform 1 from public.classes where id = v_row.class_id for update;
  update public.enrolments set status = 'withdrawn' where id = p_enrolment_id and status <> 'withdrawn';

  if v_row.status = 'enrolled' then
    return query select * from public._promote_waitlist(v_row.class_id);
  end if;
end;
$$;

-- Admin: promote from the waitlist after raising a class's capacity.
create function public.promote_waitlist(p_class_id uuid)
returns table (enrolment_id uuid, email text, student_name text, class_name text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admins only.' using errcode = '42501';
  end if;
  perform 1 from public.classes where id = p_class_id for update;
  return query select * from public._promote_waitlist(p_class_id);
end;
$$;

-- Only signed-in users can call the enrolment functions; internal helper is not callable.
revoke all on function public.enrol_student(uuid, uuid) from public, anon;
revoke all on function public.withdraw_enrolment(uuid) from public, anon;
revoke all on function public.promote_waitlist(uuid) from public, anon;
revoke all on function public._promote_waitlist(uuid) from public, anon, authenticated;
grant execute on function public.enrol_student(uuid, uuid) to authenticated;
grant execute on function public.withdraw_enrolment(uuid) to authenticated;
grant execute on function public.promote_waitlist(uuid) to authenticated;
grant execute on function public.class_availability() to anon, authenticated;
