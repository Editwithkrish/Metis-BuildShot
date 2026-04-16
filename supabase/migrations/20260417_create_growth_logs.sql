-- Create a table for growth tracking logs
create table public.growth_logs (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  weight decimal not null,
  height decimal,
  logged_at date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.growth_logs enable row level security;

-- Set up RLS policies
create policy "Users can view their own growth logs" on public.growth_logs
  for select using (auth.uid() = profile_id);

create policy "Users can insert their own growth logs" on public.growth_logs
  for insert with check (auth.uid() = profile_id);

create policy "Users can delete their own growth logs" on public.growth_logs
  for delete using (auth.uid() = profile_id);

-- Create index for faster queries
create index growth_logs_profile_id_idx on public.growth_logs(profile_id);
create index growth_logs_logged_at_idx on public.growth_logs(logged_at);
