-- Fix pg_net extension access issue and test the trigger manually
-- The function needs to reference the extension in the correct schema

CREATE OR REPLACE FUNCTION public.trigger_originality_analysis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  -- Make HTTP request to analyze-originality edge function
  -- This will run in the background after the post is inserted
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

-- Manually trigger the analysis for the two new posts we just created
SELECT public.trigger_originality_analysis() 
FROM (VALUES 
  (ROW('724bb217-6834-4b35-97c4-2f9488335c46'::uuid, 'bf4c09a0-3617-4892-9027-aa62e208ee64'::uuid, 'Quick Cooking Hack That Changed My Life', 'https://vt.tiktok.com/ZSAXjuu7C')::posts),
  (ROW('a450ac8f-e710-4f5e-9e25-ea40d06ec169'::uuid, 'bf4c09a0-3617-4892-9027-aa62e208ee64'::uuid, 'Amazing Pet Tricks Compilation', 'https://vt.tiktok.com/ZSAXjW5YC')::posts)
) AS fake_trigger(new);
