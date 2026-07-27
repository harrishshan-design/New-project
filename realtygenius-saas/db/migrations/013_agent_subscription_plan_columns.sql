alter table public.users
  add column if not exists plan text not null default 'free',
  add column if not exists subscription_status text not null default 'inactive',
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;

create index if not exists users_plan_subscription_status_idx
  on public.users(plan, subscription_status);

do $$
begin
  if to_regclass('public.profiles') is not null then
    execute 'alter table public.profiles add column if not exists plan text default ''free''';
    execute 'alter table public.profiles add column if not exists subscription_status text default ''inactive''';
    execute 'alter table public.profiles add column if not exists stripe_customer_id text';
    execute 'alter table public.profiles add column if not exists stripe_subscription_id text';
  end if;
end $$;
