-- Migration: Remove Pregnancy status and ensure pediatric focus
-- Date: 2026-04-17

-- 1. Remove pregnancy related columns from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_pregnant;

-- 2. Ensure patients table supports full naming (already exists)
-- This migration ensures we don't track pregnancy as a status anymore.

-- Cleanup nutrition_logs if any pregnancy metadata was stored (not currently the case in schema)
