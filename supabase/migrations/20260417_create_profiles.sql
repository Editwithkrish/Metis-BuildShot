-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text,
  detail text,
  language text default 'English',
  alert_type text default 'SMS',
  data_source text default 'Manual',
  weight text,
  height text,
  age text,
  feeding_status text,
  clinical_load text,
  goal text,
  onboarding_completed boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table public.profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- After setting this up, you can add more data to the profile in the onboarding flow.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
