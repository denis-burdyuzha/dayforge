-- ============================================================
-- Checks for apply_day_report. Plain SQL: run after the migrations + supabase/tests/pglite/seed.sql as a
-- superuser. Every check raises on failure; the script runs in one transaction and rolls back at the end.
-- In this repo it runs in vitest on PGlite (supabase/tests/apply_day_report.test.ts).
-- ============================================================
-- Seed (seed.sql): user A 11111111-…, character aaaaaaaa-…, skills «Английский» (5a…01), «Бег» (5a…02),
-- plan 2026-11-20 with pending «Пробежка» (90…01, 1h) and completed «Чтение» (90…02, 2h).
-- User B 22222222-…, skill «Гитара» (5b…01), pending quest «Гаммы» (90…0b).

begin;

-- aliases for the dedup check
update public.character_skills set aliases = array['англ', 'English'] where id = '5a000000-0000-0000-0000-000000000001';

-- successful parses written by the Edge Function (service role); p_a5 belongs to B
insert into public.day_report_parses (id, user_id, report_date, input_text, model, status) values
  ('a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', '2026-11-20', 't', 'm', 'ok'),
  ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', '2026-11-20', 't', 'm', 'ok'),
  ('a0000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', '2026-11-20', 't', 'm', 'ok'),
  ('a0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', '2026-11-20', 't', 'm', 'invalid_output'),
  ('a0000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', '2026-11-20', 't', 'm', 'ok'),
  ('a0000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', '2026-11-21', 't', 'm', 'ok');

create temporary table t_result (name text primary key, r jsonb);
grant all on t_result to authenticated;

-- ── 1. Apply as A: planned quest + new skill + existing skill + no skill ──
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);

insert into t_result values ('first', public.apply_day_report('2026-11-20', '[
  {"description": "Пробежка 5 км", "hours": 1.5, "planned_quest_id": "90000000-0000-0000-0000-000000000001",
   "skill": {"kind": "existing", "skill_id": "5a000000-0000-0000-0000-000000000002"}},
  {"description": "Рисовал скетчи", "hours": 2, "planned_quest_id": null,
   "skill": {"kind": "new", "name": "  Рисование ", "attributes": ["creativity", "focus"], "icon": "drawing"}},
  {"description": "Урок английского", "hours": 1, "planned_quest_id": null,
   "skill": {"kind": "existing", "skill_id": "5a000000-0000-0000-0000-000000000001"}},
  {"description": "Уборка", "hours": 0.5, "planned_quest_id": null, "skill": {"kind": "none"}}
]'::jsonb, 'a0000000-0000-0000-0000-000000000001'));

reset role;

do $$
declare r jsonb := (select r from t_result where name = 'first');
begin
  -- XP: 1.5h→15, 2h→20, 1h→10, 0.5h→5
  if (r->>'xpAwarded')::int <> 50 then raise exception 'first: xpAwarded %', r->>'xpAwarded'; end if;
  if (r->>'success')::boolean is not true then raise exception 'first: success'; end if;
  if jsonb_array_length(r->'events') <> 4 then raise exception 'first: events %', r->'events'; end if;
  if jsonb_array_length(r->'newSkills') <> 1 or r->'newSkills'->0->>'name' <> 'Рисование'
     or r->'newSkills'->0->>'icon' <> 'drawing' then
    raise exception 'first: newSkills %', r->'newSkills';
  end if;
  -- 2h completed before + 5h now
  if (r->>'totalHours')::numeric <> 7 then raise exception 'first: totalHours %', r->>'totalHours'; end if;
  if (select total_xp from public.characters where id = 'aaaaaaaa-0000-0000-0000-00000000000a') <> 50 then
    raise exception 'first: character total_xp';
  end if;
  if (select status from public.quests where id = '90000000-0000-0000-0000-000000000001') <> 'completed'
     or (select hours from public.quests where id = '90000000-0000-0000-0000-000000000001') <> 1.5 then
    raise exception 'first: planned quest not completed with the reported hours';
  end if;
  if (select count(*) from public.quests where daily_plan_id = 'd0000000-0000-0000-0000-00000000000a') <> 5 then
    raise exception 'first: expected 3 new quests on the plan';
  end if;
  if (select count(*) from public.character_skills where character_id = 'aaaaaaaa-0000-0000-0000-00000000000a'
        and name = 'Рисование'
        and primary_attribute_id = (select id from public.attribute_definitions where code = 'creativity')
        and secondary_attribute_id = (select id from public.attribute_definitions where code = 'focus')) <> 1 then
    raise exception 'first: new skill row with 2 attributes';
  end if;
  -- creativity +1 (Рисование), focus +1 (Рисование), endurance +1 (Бег), intelligence +1 (Английский)
  if (select sum(value) from public.character_attributes
      where character_id = 'aaaaaaaa-0000-0000-0000-00000000000a') <> 7 + 4 then
    raise exception 'first: attribute total';
  end if;
end $$;

-- ── 2. Idempotency: the same parse_id again → previous result, nothing credited twice ──
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
insert into t_result values ('replay', public.apply_day_report('2026-11-20', '[
  {"description": "Что угодно", "hours": 3, "planned_quest_id": null, "skill": {"kind": "none"}}
]'::jsonb, 'a0000000-0000-0000-0000-000000000001'));
reset role;

do $$
declare r jsonb := (select r from t_result where name = 'replay');
begin
  if (r->>'replayed')::boolean is not true or (r->>'xpAwarded')::int <> 50 then
    raise exception 'replay: expected the stored result, got %', r;
  end if;
  if (select total_xp from public.characters where id = 'aaaaaaaa-0000-0000-0000-00000000000a') <> 50 then
    raise exception 'replay: XP credited twice';
  end if;
  if (select count(*) from public.quests where daily_plan_id = 'd0000000-0000-0000-0000-00000000000a') <> 5 then
    raise exception 'replay: quests created twice';
  end if;
end $$;

-- ── 3. Day limit: 7h already + 9.5h > 16 → DAY_HOURS_LIMIT, nothing written (also not the new skill) ──
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
do $$
declare v_failed boolean := false;
begin
  begin
    perform public.apply_day_report('2026-11-20', '[
      {"description": "Кодил", "hours": 8, "planned_quest_id": null,
       "skill": {"kind": "new", "name": "Программирование", "attributes": ["intelligence"], "icon": "code"}},
      {"description": "Ещё", "hours": 1.5, "planned_quest_id": null, "skill": {"kind": "none"}}
    ]'::jsonb, 'a0000000-0000-0000-0000-000000000002');
  exception when others then
    if sqlerrm <> 'DAY_HOURS_LIMIT' then raise; end if;
    v_failed := true;
  end;
  if not v_failed then raise exception 'limit: expected DAY_HOURS_LIMIT'; end if;
end $$;
reset role;

do $$
begin
  if (select total_xp from public.characters where id = 'aaaaaaaa-0000-0000-0000-00000000000a') <> 50 then
    raise exception 'limit: XP was written';
  end if;
  if exists (select 1 from public.character_skills where name = 'Программирование') then
    raise exception 'limit: skill was written';
  end if;
  if exists (select 1 from public.day_report_applications where parse_id = 'a0000000-0000-0000-0000-000000000002') then
    raise exception 'limit: parse was marked applied';
  end if;
end $$;

-- per-event hours outside 0.1–8 → INVALID_HOURS
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
do $$
declare v_failed boolean := false;
begin
  begin
    perform public.apply_day_report('2026-11-20',
      '[{"description": "x", "hours": 9, "planned_quest_id": null, "skill": {"kind": "none"}}]'::jsonb,
      'a0000000-0000-0000-0000-000000000002');
  exception when others then
    if sqlerrm <> 'INVALID_HOURS' then raise; end if;
    v_failed := true;
  end;
  if not v_failed then raise exception 'hours: expected INVALID_HOURS'; end if;
end $$;

-- new skill with 3 attributes / an unknown attribute → INVALID_SKILL_ATTRIBUTES
do $$
declare v_failed boolean;
begin
  v_failed := false;
  begin
    perform public.apply_day_report('2026-11-20', '[{"description": "x", "hours": 1, "planned_quest_id": null,
      "skill": {"kind": "new", "name": "Шахматы", "attributes": ["focus", "intelligence", "discipline"]}}]'::jsonb,
      'a0000000-0000-0000-0000-000000000002');
  exception when others then
    if sqlerrm <> 'INVALID_SKILL_ATTRIBUTES' then raise; end if;
    v_failed := true;
  end;
  if not v_failed then raise exception 'attrs: expected INVALID_SKILL_ATTRIBUTES for 3 attributes'; end if;

  v_failed := false;
  begin
    perform public.apply_day_report('2026-11-20', '[{"description": "x", "hours": 1, "planned_quest_id": null,
      "skill": {"kind": "new", "name": "Шахматы", "attributes": ["luck"]}}]'::jsonb,
      'a0000000-0000-0000-0000-000000000002');
  exception when others then
    if sqlerrm <> 'INVALID_SKILL_ATTRIBUTES' then raise; end if;
    v_failed := true;
  end;
  if not v_failed then raise exception 'attrs: expected INVALID_SKILL_ATTRIBUTES for an unknown code'; end if;
end $$;
reset role;

-- ── 4. Skill dedup by alias: «new» skill " АНГЛ " → existing «Английский», no new row ──
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
insert into t_result values ('alias', public.apply_day_report('2026-11-20', '[
  {"description": "Сериал на английском", "hours": 1, "planned_quest_id": null,
   "skill": {"kind": "new", "name": "  АНГЛ ", "attributes": ["social"], "icon": "languages"}},
  {"description": "Рисовал ещё", "hours": 1, "planned_quest_id": null,
   "skill": {"kind": "new", "name": "рисование", "attributes": ["creativity"], "icon": "drawing"}}
]'::jsonb, 'a0000000-0000-0000-0000-000000000003'));
reset role;

do $$
declare r jsonb := (select r from t_result where name = 'alias');
begin
  if r->'events'->0->>'skillId' <> '5a000000-0000-0000-0000-000000000001'
     or (r->'events'->0->>'createdSkill')::boolean then
    raise exception 'alias: expected the existing «Английский», got %', r->'events'->0;
  end if;
  if r->'events'->1->>'skillName' <> 'Рисование' or (r->'events'->1->>'createdSkill')::boolean then
    raise exception 'alias: expected the existing «Рисование» by normalised name, got %', r->'events'->1;
  end if;
  if jsonb_array_length(r->'newSkills') <> 0 then raise exception 'alias: newSkills %', r->'newSkills'; end if;
  if (select count(*) from public.character_skills where character_id = 'aaaaaaaa-0000-0000-0000-00000000000a') <> 3 then
    raise exception 'alias: a duplicate skill was created';
  end if;
end $$;

-- ── 5. Other users: foreign parse, foreign skill, foreign planned quest, failed parse ──
-- B calls with A's parse → PARSE_NOT_FOUND
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
do $$
declare v_failed boolean := false;
begin
  begin
    perform public.apply_day_report('2026-11-20',
      '[{"description": "x", "hours": 1, "planned_quest_id": null, "skill": {"kind": "none"}}]'::jsonb,
      'a0000000-0000-0000-0000-000000000001');
  exception when others then
    if sqlerrm <> 'PARSE_NOT_FOUND' then raise; end if;
    v_failed := true;
  end;
  if not v_failed then raise exception 'foreign: B used A''s parse'; end if;
end $$;

-- B cannot read A's parse log rows
do $$
begin
  if exists (select 1 from public.day_report_parses where user_id = '11111111-1111-1111-1111-111111111111') then
    raise exception 'rls: B sees A''s parse rows';
  end if;
end $$;
reset role;

-- A with B's skill / B's planned quest / a failed parse / a parse of another date
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
do $$
declare v_failed boolean;
begin
  insert into public.day_report_parses (id, user_id, report_date, input_text, model, status)
  values ('a0000000-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', '2026-11-20', 't', 'm', 'ok');
  raise exception 'rls: A could insert into day_report_parses';
exception when insufficient_privilege then
  null; -- expected: only the service role writes the parse log
end $$;

do $$
declare v_failed boolean;
begin
  v_failed := false;
  begin
    perform public.apply_day_report('2026-11-20', '[{"description": "x", "hours": 1, "planned_quest_id": null,
      "skill": {"kind": "existing", "skill_id": "5b000000-0000-0000-0000-000000000001"}}]'::jsonb,
      'a0000000-0000-0000-0000-000000000002');
  exception when others then
    if sqlerrm <> 'SKILL_NOT_FOUND' then raise; end if;
    v_failed := true;
  end;
  if not v_failed then raise exception 'foreign: A used B''s skill'; end if;

  v_failed := false;
  begin
    perform public.apply_day_report('2026-11-20', '[{"description": "x", "hours": 1,
      "planned_quest_id": "90000000-0000-0000-0000-00000000000b", "skill": {"kind": "none"}}]'::jsonb,
      'a0000000-0000-0000-0000-000000000002');
  exception when others then
    if sqlerrm <> 'QUEST_NOT_FOUND' then raise; end if;
    v_failed := true;
  end;
  if not v_failed then raise exception 'foreign: A completed B''s quest'; end if;

  v_failed := false;
  begin
    perform public.apply_day_report('2026-11-20',
      '[{"description": "x", "hours": 1, "planned_quest_id": null, "skill": {"kind": "none"}}]'::jsonb,
      'a0000000-0000-0000-0000-000000000004');
  exception when others then
    if sqlerrm <> 'PARSE_NOT_FOUND' then raise; end if;
    v_failed := true;
  end;
  if not v_failed then raise exception 'parse: a failed parse was applied'; end if;

  v_failed := false;
  begin
    perform public.apply_day_report('2026-11-20',
      '[{"description": "x", "hours": 1, "planned_quest_id": null, "skill": {"kind": "none"}}]'::jsonb,
      'a0000000-0000-0000-0000-000000000006');
  exception when others then
    if sqlerrm <> 'PARSE_NOT_FOUND' then raise; end if;
    v_failed := true;
  end;
  if not v_failed then raise exception 'parse: a parse of another date was applied'; end if;
end $$;
reset role;

-- B's data untouched
do $$
begin
  if (select total_xp from public.characters where id = 'bbbbbbbb-0000-0000-0000-00000000000b') <> 0
     or (select status from public.quests where id = '90000000-0000-0000-0000-00000000000b') <> 'pending' then
    raise exception 'foreign: B''s data changed';
  end if;
end $$;

-- ── 6. Not callable by anon; the completion core is not callable by API roles ──
do $$
begin
  if has_function_privilege('anon', 'public.apply_day_report(date, jsonb, uuid)', 'execute') then
    raise exception 'grants: anon can execute apply_day_report';
  end if;
  if has_function_privilege('authenticated', 'public._complete_quest_core(uuid, uuid, uuid)', 'execute') then
    raise exception 'grants: authenticated can execute _complete_quest_core';
  end if;
end $$;

rollback;
