-- CREATE CHAT HISTORY TABLE
CREATE TABLE public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat history" ON public.chat_messages
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own chat history" ON public.chat_messages
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- CREATE VACCINATION LOGS (to store which ones are completed)
CREATE TABLE public.vaccination_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    vaccine_id TEXT NOT NULL,
    status TEXT CHECK (status IN ('completed', 'pending')),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(patient_id, vaccine_id)
);

-- Enable RLS on vaccination_logs
ALTER TABLE public.vaccination_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vaccination logs" ON public.vaccination_logs
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own vaccination logs" ON public.vaccination_logs
    FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own vaccination logs" ON public.vaccination_logs
    FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own vaccination logs" ON public.vaccination_logs
    FOR DELETE USING (auth.uid() = profile_id);

-- INDEXING
CREATE INDEX idx_chat_profile ON public.chat_messages(profile_id);
CREATE INDEX idx_chat_patient ON public.chat_messages(patient_id);
CREATE INDEX idx_vaccination_patient ON public.vaccination_logs(patient_id);
