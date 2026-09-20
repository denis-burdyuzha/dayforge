-- ============================================================
-- Dayforge — Complete Onboarding RPC
-- ============================================================


-- ============================================================
-- Step 1: Add onboarding_completed flag to profiles
-- ============================================================

alter table public.profiles
    add column if not exists onboarding_completed boolean not null default false;


-- ============================================================
-- Step 2: RPC complete_onboarding
--
-- Called once per user after the onboarding wizard is finished.
-- Atomically:
--   1. Updates profiles (username, onboarding_completed = true)
--   2. Inserts a character (name, class)
--   3. Seeds all 7 character_attributes with value = 1
--   4. Seeds user_skills for starting directions that exist in skills table
--
-- Returns: jsonb { "character_id": "<uuid>" }
-- ============================================================

create or replace function public.complete_onboarding(
    p_username           text,
    p_character_name     text,
    p_class_id           text,
    p_starting_directions text[]
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp   -- защита от search_path injection на SECURITY DEFINER функциях
as $$
declare
    -- SUPABASE-SPECIFIC: при переходе на собственный auth заменить эту строку
    -- на получение user_id из вашей системы авторизации (единственная точка привязки).
    v_user_id            uuid := auth.uid();

    v_character_id       uuid;
    v_already_completed  boolean;
    v_valid_classes      text[] := array[
        'warrior', 'creator', 'explorer', 'strategist', 'wanderer'
    ];
    v_valid_directions   text[] := array[
        'programming', 'fitness', 'learning',
        'career', 'finance', 'social', 'creativity'
    ];
    v_direction          text;
    v_skill_id           uuid;
    v_attr_code          text;
    v_attr_id            uuid;
begin

    -- --------------------------------------------------------
    -- Guard: пользователь должен быть аутентифицирован
    -- --------------------------------------------------------
    if v_user_id is null then
        raise exception 'Not authenticated';
    end if;

    -- --------------------------------------------------------
    -- Guard: повторный вызов запрещён
    -- --------------------------------------------------------
    select onboarding_completed
    into   v_already_completed
    from   public.profiles
    where  id = v_user_id;

    if v_already_completed is true then
        raise exception 'Onboarding already completed';
    end if;

    -- --------------------------------------------------------
    -- Валидация p_class_id на сервере
    -- --------------------------------------------------------
    if not (p_class_id = any(v_valid_classes)) then
        raise exception 'Invalid class_id: %. Allowed values: %',
            p_class_id,
            array_to_string(v_valid_classes, ', ');
    end if;

    -- --------------------------------------------------------
    -- Валидация p_starting_directions на сервере
    -- --------------------------------------------------------
    foreach v_direction in array p_starting_directions loop
        if not (v_direction = any(v_valid_directions)) then
            raise exception 'Invalid starting direction: %. Allowed values: %',
                v_direction,
                array_to_string(v_valid_directions, ', ');
        end if;
    end loop;

    -- --------------------------------------------------------
    -- 1. Обновить профиль
    -- --------------------------------------------------------
    update public.profiles
    set
        username             = p_username,
        onboarding_completed = true,
        updated_at           = now()
    where id = v_user_id;

    -- --------------------------------------------------------
    -- 2. Создать персонажа
    -- --------------------------------------------------------
    insert into public.characters (profile_id, name, class)
    values (v_user_id, p_character_name, p_class_id)
    returning id into v_character_id;

    -- --------------------------------------------------------
    -- 3. Засеять все 7 атрибутов со стартовым значением = 1
    --    Lookup по code → id из attribute_definitions
    -- --------------------------------------------------------
    foreach v_attr_code in array array[
        'endurance', 'intelligence', 'social',
        'strength', 'discipline', 'creativity', 'focus'
    ] loop
        select id
        into   v_attr_id
        from   public.attribute_definitions
        where  code = v_attr_code;

        if v_attr_id is null then
            raise exception 'Attribute definition not found for code: %', v_attr_code;
        end if;

        insert into public.character_attributes (character_id, attribute_id, value)
        values (v_character_id, v_attr_id, 1);
    end loop;

    -- --------------------------------------------------------
    -- 4. Засеять стартовые скиллы (только те направления,
    --    для которых есть запись в skills по code)
    -- --------------------------------------------------------
    foreach v_direction in array p_starting_directions loop
        select id
        into   v_skill_id
        from   public.skills
        where  code = v_direction;

        -- Направление может не иметь соответствующего скилла —
        -- в таком случае просто пропускаем, не падаем
        if v_skill_id is not null then
            insert into public.user_skills (character_id, skill_id, level, xp)
            values (v_character_id, v_skill_id, 1, 0)
            on conflict (character_id, skill_id) do nothing;
        end if;
    end loop;

    -- --------------------------------------------------------
    -- Вернуть character_id клиенту
    -- --------------------------------------------------------
    return jsonb_build_object('character_id', v_character_id);

end;
$$;


-- ============================================================
-- Права на вызов функции
-- ============================================================

-- Разрешаем вызов только аутентифицированным пользователям
revoke all on function public.complete_onboarding(text, text, text, text[]) from public;
grant execute on function public.complete_onboarding(text, text, text, text[]) to authenticated;
