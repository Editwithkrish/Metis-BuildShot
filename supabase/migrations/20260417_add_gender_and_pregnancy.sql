-- Add pregnancy status and gender fields to profiles
alter table public.profiles 
add column is_pregnant boolean default false,
add column gender text;

-- Update RLS or other logic if needed (usually not needed if just adding columns)
