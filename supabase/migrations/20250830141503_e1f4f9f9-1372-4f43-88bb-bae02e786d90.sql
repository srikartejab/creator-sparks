-- Fix security warnings from linter

-- 1. Fix function search path security issue
CREATE OR REPLACE FUNCTION public.trigger_originality_analysis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Make HTTP request to analyze-originality edge function
  -- This will run in the background after the post is inserted
  PERFORM net.http_post(
    url := 'https://your-project-id.supabase.co/functions/v1/analyze-originality',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('postId', NEW.id::text)
  );
  
  RETURN NEW;
END;
$$;

-- 2. Move pg_net extension to extensions schema (recommended practice)
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
