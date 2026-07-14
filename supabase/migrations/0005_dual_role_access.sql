-- Lets admin grant an existing account dual buyer+agent access without a
-- code deploy. When set, the account can log in as either its primary
-- role or this secondary one - whichever tab they pick on login.html.
alter table public.users
    add column if not exists secondary_role text;
