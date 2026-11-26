-- Shared test fixtures (run as the superuser before a test script).
-- User A (11111111-…) with character + 7 attributes, skill «Английский» (aliases англ/english, intelligence),
-- a plan for 2026-11-20 with one pending quest «Пробежка» (skill «Бег», 1h) and one already completed quest (2h).
-- User B (22222222-…) with a character and skill «Гитара».

insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'a@test.local', '{"username":"user_a"}'),
  ('22222222-2222-2222-2222-222222222222', 'b@test.local', '{"username":"user_b"}');

insert into public.characters (id, profile_id, name, class) values
  ('aaaaaaaa-0000-0000-0000-00000000000a', '11111111-1111-1111-1111-111111111111', 'Альфа', 'explorer'),
  ('bbbbbbbb-0000-0000-0000-00000000000b', '22222222-2222-2222-2222-222222222222', 'Бета', 'warrior');

insert into public.character_attributes (character_id, attribute_id, value)
select c.id, ad.id, 1
from public.characters c cross join public.attribute_definitions ad;

insert into public.character_skills (id, character_id, name, primary_attribute_id, total_hours, total_xp)
values
  ('5a000000-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-00000000000a', 'Английский',
   (select id from public.attribute_definitions where code = 'intelligence'), 0, 0),
  ('5a000000-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-00000000000a', 'Бег',
   (select id from public.attribute_definitions where code = 'endurance'), 0, 0),
  ('5b000000-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-00000000000b', 'Гитара',
   (select id from public.attribute_definitions where code = 'creativity'), 0, 0);

insert into public.daily_plans (id, character_id, date) values
  ('d0000000-0000-0000-0000-00000000000a', 'aaaaaaaa-0000-0000-0000-00000000000a', '2026-11-20'),
  ('d0000000-0000-0000-0000-00000000000b', 'bbbbbbbb-0000-0000-0000-00000000000b', '2026-11-20');

insert into public.quests (id, daily_plan_id, title, status, position, skill_id, skill_name, hours) values
  ('90000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-00000000000a', 'Пробежка', 'pending', 0,
   '5a000000-0000-0000-0000-000000000002', 'Бег', 1),
  ('90000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-00000000000a', 'Чтение', 'completed', 1,
   null, null, 2),
  ('90000000-0000-0000-0000-00000000000b', 'd0000000-0000-0000-0000-00000000000b', 'Гаммы', 'pending', 0,
   '5b000000-0000-0000-0000-000000000001', 'Гитара', 1);
