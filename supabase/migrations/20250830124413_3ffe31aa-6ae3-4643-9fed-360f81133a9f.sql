-- Add originality_detector role to the enum
ALTER TYPE public.app_role ADD VALUE 'originality_detector';

-- Update posts RLS policy to include originality_detector
DROP POLICY "Users can view their own posts" ON public.posts;
CREATE POLICY "Users can view their own posts" 
ON public.posts 
FOR SELECT 
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'fraud_detector'::app_role) OR has_role(auth.uid(), 'originality_detector'::app_role));

-- Add RLS policies for originality_detector on quality_assessments
CREATE POLICY "Originality detectors can insert quality assessments" 
ON public.quality_assessments 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'originality_detector'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Originality detectors can update quality assessments" 
ON public.quality_assessments 
FOR UPDATE 
USING (has_role(auth.uid(), 'originality_detector'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Optional: assign originality_detector role to a user
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'originality_detector'::app_role
-- FROM auth.users
-- WHERE email = 'you@example.com';
