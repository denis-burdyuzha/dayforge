-- Minimal stand-in for the Supabase platform pieces our migrations rely on, so that all migrations can run in
-- PGlite (Postgres in WASM) for tests: the auth schema with users + auth.uid(), and the API roles.
-- auth.uid() reads the `request.jwt.claim.sub` setting, exactly like Supabase.

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;

create table auth.users (
    id uuid primary key,
    email text,
    raw_user_meta_data jsonb default '{}'::jsonb
);

create function auth.uid() returns uuid
language sql stable
as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

grant usage on schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;

-- Older Supabase projects (this one) exposed every new public table to the API roles by default; RLS decides
-- what rows they see. New migrations still GRANT explicitly (the new platform default does not auto-expose).
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
