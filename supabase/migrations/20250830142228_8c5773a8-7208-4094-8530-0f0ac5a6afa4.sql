-- Fix the function and manually test it with a simpler approach
CREATE OR REPLACE FUNCTION public.trigger_originality_analysis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  -- Make HTTP request to analyze-originality edge function
  PERFORM extensions.http_post(
    url := 'https://your-project-id.supabase.co/functions/v1/analyze-originality',
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('postId', NEW.id::text)
  );
  
  RETURN NEW;
END;
$$;

-- Seed data moved to supabase/seed.sql
