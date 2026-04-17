-- ADD SESSION_ID TO CHAT MESSAGES
ALTER TABLE public.chat_messages ADD COLUMN session_id UUID DEFAULT gen_random_uuid();
CREATE INDEX idx_chat_session ON public.chat_messages(session_id);
