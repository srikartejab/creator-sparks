-- Put pg_net back in public schema and fix the function call
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Fix the trigger function with correct pg_net function reference
CREATE OR REPLACE FUNCTION public.trigger_originality_analysis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Make HTTP request to analyze-originality edge function
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
