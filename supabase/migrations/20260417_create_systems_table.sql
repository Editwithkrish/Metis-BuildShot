-- Create systems table
CREATE TABLE IF NOT EXISTS public.systems (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT UNIQUE DEFAULT 'malnutrition-model',
  model_url TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize the row
INSERT INTO public.systems (name, model_url) 
VALUES ('malnutrition-model', 'https://initializing.com')
ON CONFLICT (name) DO NOTHING;

-- Disable RLS to allow the anon/publishable key to update it 
-- (from the python script)
ALTER TABLE public.systems DISABLE ROW LEVEL SECURITY;
