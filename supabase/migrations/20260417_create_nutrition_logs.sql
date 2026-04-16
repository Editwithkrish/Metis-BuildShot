-- Create a table for nutrition tracking logs
create table public.nutrition_logs (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  meal_type text not null,
  food_name text not null,
  quantity text not null,
  calories integer,
  protein integer,
  carbs integer,
  fats integer,
  logged_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.nutrition_logs enable row level security;

-- Set up RLS policies
create policy "Users can view their own nutrition logs" on public.nutrition_logs
  for select using (auth.uid() = profile_id);

create policy "Users can insert their own nutrition logs" on public.nutrition_logs
  for insert with check (auth.uid() = profile_id);

create policy "Users can delete their own nutrition logs" on public.nutrition_logs
  for delete using (auth.uid() = profile_id);

-- Create index for faster queries
create index nutrition_logs_profile_id_idx on public.nutrition_logs(profile_id);
create index nutrition_logs_logged_at_idx on public.nutrition_logs(logged_at);
create index nutrition_logs_meal_type_idx on public.nutrition_logs(meal_type);
