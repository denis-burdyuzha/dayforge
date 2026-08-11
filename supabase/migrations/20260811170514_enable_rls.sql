-- ============================================================
-- Dayforge — Row Level Security
-- ============================================================


-- ============================================================
-- Enable RLS
-- ============================================================

alter table public.profiles enable row level security;
alter table public.characters enable row level security;

alter table public.attribute_definitions enable row level security;
alter table public.character_attributes enable row level security;

alter table public.skills enable row level security;
alter table public.user_skills enable row level security;

alter table public.daily_plans enable row level security;
alter table public.quests enable row level security;

alter table public.daily_reports enable row level security;
alter table public.report_events enable row level security;
alter table public.event_impacts enable row level security;

alter table public.xp_transactions enable row level security;
alter table public.daily_states enable row level security;


-- ============================================================
-- Attribute definitions
-- Read-only for authenticated users
-- ============================================================

create policy "Authenticated users can view attributes"
on public.attribute_definitions
for select
to authenticated
using (true);


-- ============================================================
-- Skills
-- Read-only for authenticated users
-- ============================================================

create policy "Authenticated users can view skills"
on public.skills
for select
to authenticated
using (true);


-- ============================================================
-- Profiles
-- ============================================================

create policy "Users can view own profile"
on public.profiles
for select
to authenticated
using (
    id = auth.uid()
);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (
    id = auth.uid()
)
with check (
    id = auth.uid()
);


-- ============================================================
-- Characters
-- ============================================================

create policy "Users can view own characters"
on public.characters
for select
to authenticated
using (
    profile_id = auth.uid()
);

create policy "Users can create own characters"
on public.characters
for insert
to authenticated
with check (
    profile_id = auth.uid()
);

create policy "Users can update own characters"
on public.characters
for update
to authenticated
using (
    profile_id = auth.uid()
)
with check (
    profile_id = auth.uid()
);

create policy "Users can delete own characters"
on public.characters
for delete
to authenticated
using (
    profile_id = auth.uid()
);


-- ============================================================
-- Character Attributes
-- ============================================================

create policy "Users can view own character attributes"
on public.character_attributes
for select
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = character_attributes.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can create own character attributes"
on public.character_attributes
for insert
to authenticated
with check (
    exists (
        select 1
        from public.characters c
        where c.id = character_attributes.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can update own character attributes"
on public.character_attributes
for update
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = character_attributes.character_id
          and c.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.characters c
        where c.id = character_attributes.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can delete own character attributes"
on public.character_attributes
for delete
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = character_attributes.character_id
          and c.profile_id = auth.uid()
    )
);


-- ============================================================
-- User Skills
-- ============================================================

create policy "Users can view own skills"
on public.user_skills
for select
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = user_skills.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can create own skills"
on public.user_skills
for insert
to authenticated
with check (
    exists (
        select 1
        from public.characters c
        where c.id = user_skills.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can update own skills"
on public.user_skills
for update
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = user_skills.character_id
          and c.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.characters c
        where c.id = user_skills.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can delete own skills"
on public.user_skills
for delete
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = user_skills.character_id
          and c.profile_id = auth.uid()
    )
);


-- ============================================================
-- Daily Plans
-- ============================================================

create policy "Users can view own daily plans"
on public.daily_plans
for select
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = daily_plans.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can create own daily plans"
on public.daily_plans
for insert
to authenticated
with check (
    exists (
        select 1
        from public.characters c
        where c.id = daily_plans.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can update own daily plans"
on public.daily_plans
for update
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = daily_plans.character_id
          and c.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.characters c
        where c.id = daily_plans.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can delete own daily plans"
on public.daily_plans
for delete
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = daily_plans.character_id
          and c.profile_id = auth.uid()
    )
);


-- ============================================================
-- Quests
-- ============================================================

create policy "Users can view own quests"
on public.quests
for select
to authenticated
using (
    exists (
        select 1
        from public.daily_plans dp
        join public.characters c
            on c.id = dp.character_id
        where dp.id = quests.daily_plan_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can create own quests"
on public.quests
for insert
to authenticated
with check (
    exists (
        select 1
        from public.daily_plans dp
        join public.characters c
            on c.id = dp.character_id
        where dp.id = quests.daily_plan_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can update own quests"
on public.quests
for update
to authenticated
using (
    exists (
        select 1
        from public.daily_plans dp
        join public.characters c
            on c.id = dp.character_id
        where dp.id = quests.daily_plan_id
          and c.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.daily_plans dp
        join public.characters c
            on c.id = dp.character_id
        where dp.id = quests.daily_plan_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can delete own quests"
on public.quests
for delete
to authenticated
using (
    exists (
        select 1
        from public.daily_plans dp
        join public.characters c
            on c.id = dp.character_id
        where dp.id = quests.daily_plan_id
          and c.profile_id = auth.uid()
    )
);


-- ============================================================
-- Daily Reports
-- ============================================================

create policy "Users can view own daily reports"
on public.daily_reports
for select
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = daily_reports.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can create own daily reports"
on public.daily_reports
for insert
to authenticated
with check (
    exists (
        select 1
        from public.characters c
        where c.id = daily_reports.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can update own daily reports"
on public.daily_reports
for update
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = daily_reports.character_id
          and c.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.characters c
        where c.id = daily_reports.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can delete own daily reports"
on public.daily_reports
for delete
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = daily_reports.character_id
          and c.profile_id = auth.uid()
    )
);


-- ============================================================
-- Report Events
-- ============================================================

create policy "Users can view own report events"
on public.report_events
for select
to authenticated
using (
    exists (
        select 1
        from public.daily_reports dr
        join public.characters c
            on c.id = dr.character_id
        where dr.id = report_events.daily_report_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can create own report events"
on public.report_events
for insert
to authenticated
with check (
    exists (
        select 1
        from public.daily_reports dr
        join public.characters c
            on c.id = dr.character_id
        where dr.id = report_events.daily_report_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can update own report events"
on public.report_events
for update
to authenticated
using (
    exists (
        select 1
        from public.daily_reports dr
        join public.characters c
            on c.id = dr.character_id
        where dr.id = report_events.daily_report_id
          and c.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.daily_reports dr
        join public.characters c
            on c.id = dr.character_id
        where dr.id = report_events.daily_report_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can delete own report events"
on public.report_events
for delete
to authenticated
using (
    exists (
        select 1
        from public.daily_reports dr
        join public.characters c
            on c.id = dr.character_id
        where dr.id = report_events.daily_report_id
          and c.profile_id = auth.uid()
    )
);


-- ============================================================
-- Event Impacts
-- ============================================================

create policy "Users can view own event impacts"
on public.event_impacts
for select
to authenticated
using (
    exists (
        select 1
        from public.report_events re
        join public.daily_reports dr
            on dr.id = re.daily_report_id
        join public.characters c
            on c.id = dr.character_id
        where re.id = event_impacts.report_event_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can create own event impacts"
on public.event_impacts
for insert
to authenticated
with check (
    exists (
        select 1
        from public.report_events re
        join public.daily_reports dr
            on dr.id = re.daily_report_id
        join public.characters c
            on c.id = dr.character_id
        where re.id = event_impacts.report_event_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can update own event impacts"
on public.event_impacts
for update
to authenticated
using (
    exists (
        select 1
        from public.report_events re
        join public.daily_reports dr
            on dr.id = re.daily_report_id
        join public.characters c
            on c.id = dr.character_id
        where re.id = event_impacts.report_event_id
          and c.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.report_events re
        join public.daily_reports dr
            on dr.id = re.daily_report_id
        join public.characters c
            on c.id = dr.character_id
        where re.id = event_impacts.report_event_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can delete own event impacts"
on public.event_impacts
for delete
to authenticated
using (
    exists (
        select 1
        from public.report_events re
        join public.daily_reports dr
            on dr.id = re.daily_report_id
        join public.characters c
            on c.id = dr.character_id
        where re.id = event_impacts.report_event_id
          and c.profile_id = auth.uid()
    )
);


-- ============================================================
-- XP Transactions
-- ============================================================

create policy "Users can view own xp transactions"
on public.xp_transactions
for select
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = xp_transactions.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can create own xp transactions"
on public.xp_transactions
for insert
to authenticated
with check (
    exists (
        select 1
        from public.characters c
        where c.id = xp_transactions.character_id
          and c.profile_id = auth.uid()
    )
);


-- ============================================================
-- Daily States
-- ============================================================

create policy "Users can view own daily states"
on public.daily_states
for select
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = daily_states.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can create own daily states"
on public.daily_states
for insert
to authenticated
with check (
    exists (
        select 1
        from public.characters c
        where c.id = daily_states.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can update own daily states"
on public.daily_states
for update
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = daily_states.character_id
          and c.profile_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.characters c
        where c.id = daily_states.character_id
          and c.profile_id = auth.uid()
    )
);

create policy "Users can delete own daily states"
on public.daily_states
for delete
to authenticated
using (
    exists (
        select 1
        from public.characters c
        where c.id = daily_states.character_id
          and c.profile_id = auth.uid()
    )
);