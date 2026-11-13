-- SAMPLE data so the portal has something to show. Replace with your real
-- term dates, class times, coaches, capacities and prices (or edit them in
-- the portal's admin page), then delete anything you don't need.

with term as (
  insert into public.terms (name, starts_on, ends_on, is_active)
  values ('Term 1 2027', date '2027-01-27', date '2027-04-02', true)
  returning id
)
insert into public.classes
  (term_id, program, name, level, description, day_of_week, start_time, end_time, coach, capacity, price_cents, sessions, min_age, max_age)
select term.id, c.program, c.name, c.level, c.description, c.day_of_week, c.start_time::time, c.end_time::time, c.coach, c.capacity, c.price_cents, c.sessions, c.min_age, c.max_age
from term, (values
  ('little-smashers',   'Little Smashers',            'Beginner',     'Games-based introduction to badminton for young kids.',            6, '09:00', '10:00', 'Pavan',    12, 25000, 10, 5,    8),
  ('junior-squad',      'Junior Group Training',      'Beginner',     'Grips, footwork and basic strokes for new junior players.',        3, '16:30', '18:00', 'Srinivas', 16, 37500, 10, 8,    16),
  ('junior-squad',      'Junior Group Training',      'Intermediate', 'Technique, fitness and match play for developing juniors.',        5, '16:30', '18:00', 'Ankit',    16, 37500, 10, 9,    17),
  ('adult-terms',       'Adult Term Class',           'Beginner',     'Learn proper grips, strokes and footwork in a relaxed setting.',   2, '19:00', '20:30', 'Apoorv',   16, 37500, 10, 16,   null),
  ('adult-terms',       'Adult Term Class',           'Intermediate', 'Sharpen technique and tactics for social and club play.',          4, '19:00', '20:30', 'Arthur Lee', 16, 37500, 10, 16, null),
  ('sparring',          'Sparring Sessions',          'Advanced',     'High-intensity match practice with coach-led drills.',             0, '17:00', '19:00', 'Pavan',    12, 30000, 10, 12,   null)
) as c(program, name, level, description, day_of_week, start_time, end_time, coach, capacity, price_cents, sessions, min_age, max_age);
