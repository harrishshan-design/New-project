-- Agent engagement: daily check-in streaks and points.
-- Points decide "frontline" ordering of agent listings in the buyer feed,
-- so dedicated agents get seen first.
create table if not exists public.agent_engagement (
    agent_id text primary key,
    points integer not null default 0,
    streak_days integer not null default 0,
    best_streak integer not null default 0,
    last_checkin_date date,
    listings_submitted integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.agent_engagement enable row level security;

drop policy if exists "service role full access agent_engagement" on public.agent_engagement;
create policy "service role full access agent_engagement"
    on public.agent_engagement
    for all
    to service_role
    using (true)
    with check (true);

create index if not exists agent_engagement_points_idx on public.agent_engagement (points desc);
