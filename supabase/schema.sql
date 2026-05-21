-- FastKeep Web MVP 用の初期スキーマです。
-- Supabase SQL Editor で実行してください。

create extension if not exists pgcrypto;

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  color text not null default 'plain' check (color in ('plain', 'amber', 'mint', 'rose', 'sky')),
  is_pinned boolean not null default false,
  is_archived boolean not null default false,
  due_at timestamptz,
  calendar_event_id text,
  calendar_projection_status text not null default 'none' check (calendar_projection_status in ('none', 'synced', 'error')),
  calendar_projection_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.google_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_updated_idx on public.notes (user_id, is_archived, is_pinned desc, updated_at desc);
create index if not exists notes_due_idx on public.notes (user_id, due_at) where due_at is not null;

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on table public.notes to authenticated, service_role;
grant select, insert, update, delete on table public.google_connections to authenticated, service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

drop trigger if exists google_connections_set_updated_at on public.google_connections;
create trigger google_connections_set_updated_at
before update on public.google_connections
for each row execute function public.set_updated_at();

alter table public.notes enable row level security;
alter table public.google_connections enable row level security;

drop policy if exists "自分のメモを参照できる" on public.notes;
create policy "自分のメモを参照できる"
on public.notes for select
using (auth.uid() = user_id);

drop policy if exists "自分のメモを追加できる" on public.notes;
create policy "自分のメモを追加できる"
on public.notes for insert
with check (auth.uid() = user_id);

drop policy if exists "自分のメモを更新できる" on public.notes;
create policy "自分のメモを更新できる"
on public.notes for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "自分のメモを削除できる" on public.notes;
create policy "自分のメモを削除できる"
on public.notes for delete
using (auth.uid() = user_id);

drop policy if exists "自分のGoogle接続を参照できる" on public.google_connections;
create policy "自分のGoogle接続を参照できる"
on public.google_connections for select
using (auth.uid() = user_id);

drop policy if exists "自分のGoogle接続を追加できる" on public.google_connections;
create policy "自分のGoogle接続を追加できる"
on public.google_connections for insert
with check (auth.uid() = user_id);

drop policy if exists "自分のGoogle接続を更新できる" on public.google_connections;
create policy "自分のGoogle接続を更新できる"
on public.google_connections for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "自分のGoogle接続を削除できる" on public.google_connections;
create policy "自分のGoogle接続を削除できる"
on public.google_connections for delete
using (auth.uid() = user_id);
