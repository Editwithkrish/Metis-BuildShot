-- STEP 1: Create the Patients table
CREATE TABLE public.patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    dob DATE,
    gender TEXT,
    initial_weight TEXT,
    initial_height TEXT,
    relationship_type TEXT CHECK (relationship_type IN ('self', 'child', 'patient', 'subject')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- STEP 2: Enable RLS on Patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own patients" ON public.patients
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own patients" ON public.patients
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own patients" ON public.patients
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own patients" ON public.patients
    FOR DELETE USING (auth.uid() = owner_id);

-- STEP 3: Add patient_id to existing log tables
ALTER TABLE public.nutrition_logs ADD COLUMN patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE;
ALTER TABLE public.growth_logs ADD COLUMN patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE;

-- STEP 4: Data Migration (Preserving legacy data)
-- For every existing profile, create a 'Default' patient entry
DO $$
DECLARE
    profile_rec RECORD;
    new_patient_id UUID;
BEGIN
    FOR profile_rec IN SELECT * FROM public.profiles LOOP
        -- Create a patient record for this profile
        INSERT INTO public.patients (owner_id, full_name, dob, gender, initial_weight, initial_height, relationship_type)
        VALUES (
            profile_rec.id, 
            COALESCE(profile_rec.full_name, 'Primary Profile'), 
            profile_rec.dob, 
            profile_rec.gender, 
            profile_rec.weight, 
            profile_rec.height,
            CASE 
                WHEN profile_rec.role = 'ind' THEN 'self'
                WHEN profile_rec.role = 'mother' THEN 'child'
                ELSE 'patient'
            END
        )
        RETURNING id INTO new_patient_id;

        -- Migrating existing logs to point to this new patient
        UPDATE public.nutrition_logs SET patient_id = new_patient_id WHERE profile_id = profile_rec.id;
        UPDATE public.growth_logs SET patient_id = new_patient_id WHERE profile_id = profile_rec.id;
    END LOOP;
END $$;

-- STEP 5: Add NOT NULL constraints after data migration
-- Note: Optional if you want to allow global/system logs, but recommended for clinical data integrity
-- ALTER TABLE public.nutrition_logs ALTER COLUMN patient_id SET NOT NULL;
-- ALTER TABLE public.growth_logs ALTER COLUMN patient_id SET NOT NULL;

-- STEP 6: Indexing for performance
CREATE INDEX idx_patients_owner ON public.patients(owner_id);
CREATE INDEX idx_nutrition_patient ON public.nutrition_logs(patient_id);
CREATE INDEX idx_growth_patient ON public.growth_logs(patient_id);
