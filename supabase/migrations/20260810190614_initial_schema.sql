-- ============================================================
-- Dayforge — Initial Database Schema
-- ============================================================

create extension if not exists "pgcrypto";


-- ============================================================
-- Profiles
-- ============================================================

create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    username text unique,
    display_name text,
    avatar_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


-- ============================================================
-- Characters
-- ============================================================

create table public.characters (
    id uuid primary key default gen_random_uuid(),
    profile_id uuid not null references public.profiles(id) on delete cascade,

    name text not null,
    class text,

    level integer not null default 1,
    total_xp integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint characters_level_check
        check (level >= 1),

    constraint characters_total_xp_check
        check (total_xp >= 0)
);

create index characters_profile_id_idx
    on public.characters(profile_id);


-- ============================================================
-- Attribute Definitions
-- ============================================================

create table public.attribute_definitions (
    id uuid primary key default gen_random_uuid(),

    code text not null unique,
    name text not null,
    description text,

    created_at timestamptz not null default now()
);


-- ============================================================
-- Character Attributes
-- ============================================================

create table public.character_attributes (
    id uuid primary key default gen_random_uuid(),

    character_id uuid not null references public.characters(id) on delete cascade,
    attribute_id uuid not null references public.attribute_definitions(id) on delete cascade,

    value integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint character_attributes_unique
        unique (character_id, attribute_id),

    constraint character_attributes_value_check
        check (value >= 0)
);

create index character_attributes_character_id_idx
    on public.character_attributes(character_id);

create index character_attributes_attribute_id_idx
    on public.character_attributes(attribute_id);


-- ============================================================
-- Skills
-- ============================================================

create table public.skills (
    id uuid primary key default gen_random_uuid(),

    code text not null unique,
    name text not null,
    description text,

    created_at timestamptz not null default now()
);


-- ============================================================
-- User Skills
-- ============================================================

create table public.user_skills (
    id uuid primary key default gen_random_uuid(),

    character_id uuid not null references public.characters(id) on delete cascade,
    skill_id uuid not null references public.skills(id) on delete cascade,

    level integer not null default 1,
    xp integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint user_skills_unique
        unique (character_id, skill_id),

    constraint user_skills_level_check
        check (level >= 1),

    constraint user_skills_xp_check
        check (xp >= 0)
);

create index user_skills_character_id_idx
    on public.user_skills(character_id);

create index user_skills_skill_id_idx
    on public.user_skills(skill_id);


-- ============================================================
-- Daily Plans
-- ============================================================

create table public.daily_plans (
    id uuid primary key default gen_random_uuid(),

    character_id uuid not null references public.characters(id) on delete cascade,

    date date not null,
    status text not null default 'planned',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint daily_plans_unique
        unique (character_id, date),

    constraint daily_plans_status_check
        check (status in ('planned', 'completed'))
);

create index daily_plans_character_id_idx
    on public.daily_plans(character_id);

create index daily_plans_date_idx
    on public.daily_plans(date);


-- ============================================================
-- Quests
-- ============================================================

create table public.quests (
    id uuid primary key default gen_random_uuid(),

    daily_plan_id uuid not null references public.daily_plans(id) on delete cascade,

    title text not null,
    description text,
    status text not null default 'pending',
    position integer not null default 0,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint quests_status_check
        check (status in ('pending', 'completed'))
);

create index quests_daily_plan_id_idx
    on public.quests(daily_plan_id);


-- ============================================================
-- Daily Reports
-- ============================================================

create table public.daily_reports (
    id uuid primary key default gen_random_uuid(),

    character_id uuid not null references public.characters(id) on delete cascade,

    date date not null,
    content text not null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint daily_reports_unique
        unique (character_id, date)
);

create index daily_reports_character_id_idx
    on public.daily_reports(character_id);

create index daily_reports_date_idx
    on public.daily_reports(date);


-- ============================================================
-- Report Events
-- ============================================================

create table public.report_events (
    id uuid primary key default gen_random_uuid(),

    daily_report_id uuid not null references public.daily_reports(id) on delete cascade,

    type text not null,
    description text not null,

    created_at timestamptz not null default now()
);

create index report_events_daily_report_id_idx
    on public.report_events(daily_report_id);


-- ============================================================
-- Event Impacts
-- ============================================================

create table public.event_impacts (
    id uuid primary key default gen_random_uuid(),

    report_event_id uuid not null references public.report_events(id) on delete cascade,

    attribute_id uuid references public.attribute_definitions(id) on delete cascade,
    skill_id uuid references public.skills(id) on delete cascade,

    value integer not null,

    created_at timestamptz not null default now(),

    constraint event_impacts_target_check
        check (
            (attribute_id is not null and skill_id is null)
            or
            (attribute_id is null and skill_id is not null)
        ),

    constraint event_impacts_value_check
        check (value <> 0)
);

create index event_impacts_report_event_id_idx
    on public.event_impacts(report_event_id);

create index event_impacts_attribute_id_idx
    on public.event_impacts(attribute_id);

create index event_impacts_skill_id_idx
    on public.event_impacts(skill_id);


-- ============================================================
-- XP Transactions
-- ============================================================

create table public.xp_transactions (
    id uuid primary key default gen_random_uuid(),

    character_id uuid not null references public.characters(id) on delete cascade,

    skill_id uuid references public.skills(id) on delete set null,
    report_event_id uuid references public.report_events(id) on delete set null,

    amount integer not null,
    reason text,

    created_at timestamptz not null default now()
);

create index xp_transactions_character_id_idx
    on public.xp_transactions(character_id);

create index xp_transactions_skill_id_idx
    on public.xp_transactions(skill_id);

create index xp_transactions_report_event_id_idx
    on public.xp_transactions(report_event_id);


-- ============================================================
-- Daily States
-- ============================================================

create table public.daily_states (
    id uuid primary key default gen_random_uuid(),

    character_id uuid not null references public.characters(id) on delete cascade,

    date date not null,

    energy integer not null default 100,
    fatigue integer not null default 0,
    focus integer not null default 100,
    mood integer not null default 50,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint daily_states_unique
        unique (character_id, date),

    constraint daily_states_energy_check
        check (energy between 0 and 100),

    constraint daily_states_fatigue_check
        check (fatigue between 0 and 100),

    constraint daily_states_focus_check
        check (focus between 0 and 100),

    constraint daily_states_mood_check
        check (mood between 0 and 100)
);

create index daily_states_character_id_idx
    on public.daily_states(character_id);

create index daily_states_date_idx
    on public.daily_states(date);