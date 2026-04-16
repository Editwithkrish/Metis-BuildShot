-- Migration to add Date of Birth (DOB) to profiles table
-- Refactors temporal tracking from text-based 'age' to date-based 'dob'
alter table public.profiles
add column dob date;

-- Optional: If you want to drop the old age column after verification
-- alter table public.profiles drop column age;
