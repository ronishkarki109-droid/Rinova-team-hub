create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key,
  email text unique not null,
  full_name text,
  role text default 'member',
  created_at timestamptz default now()
);

create table if not exists public.channels (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text,
  created_at timestamptz default now()
);

create table if not exists public.attachments (
  id uuid primary key default uuid_generate_v4(),
  message_id uuid not null references public.messages(id) on delete cascade,
  file_url text not null,
  file_type text,
  file_name text,
  uploaded_at timestamptz default now()
);

insert into public.channels (name, description)
values
  ('general', 'Main team discussion'),
  ('design', 'Design feedback and tasks'),
  ('clients', 'Client updates and files'),
  ('website', 'Website projects and fixes')
on conflict (name) do nothing;

alter table public.profiles enable row level security;
alter table public.channels enable row level security;
alter table public.messages enable row level security;
alter table public.attachments enable row level security;

drop policy if exists "Profiles read" on public.profiles;
create policy "Profiles read" on public.profiles for select to authenticated using (true);

drop policy if exists "Profiles upsert own" on public.profiles;
create policy "Profiles upsert own" on public.profiles for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own" on public.profiles for update to authenticated using (auth.uid() = id);

drop policy if exists "Channels read" on public.channels;
create policy "Channels read" on public.channels for select to authenticated using (true);

drop policy if exists "Channels insert" on public.channels;
create policy "Channels insert" on public.channels for insert to authenticated with check (auth.uid() = created_by or created_by is null);

drop policy if exists "Messages read" on public.messages;
create policy "Messages read" on public.messages for select to authenticated using (true);

drop policy if exists "Messages insert own" on public.messages;
create policy "Messages insert own" on public.messages for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "Attachments read" on public.attachments;
create policy "Attachments read" on public.attachments for select to authenticated using (true);

drop policy if exists "Attachments insert" on public.attachments;
create policy "Attachments insert" on public.attachments for insert to authenticated with check (true);

insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read chat media" on storage.objects;
create policy "Public read chat media" on storage.objects for select to public using (bucket_id = 'chat-media');

drop policy if exists "Authenticated upload chat media" on storage.objects;
create policy "Authenticated upload chat media" on storage.objects for insert to authenticated with check (bucket_id = 'chat-media');
