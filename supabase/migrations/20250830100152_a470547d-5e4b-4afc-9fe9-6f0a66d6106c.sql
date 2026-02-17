-- Create enum for application roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'fraud_detector', 'moderator');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Update posts table RLS policies to include fraud detector access
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;

CREATE POLICY "Users can view their own posts" 
ON public.posts 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'fraud_detector')
);

CREATE POLICY "Users can create their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin')
);

-- Update fraud_alerts table RLS policies
DROP POLICY IF EXISTS "Users can view fraud alerts for their posts" ON public.fraud_alerts;

CREATE POLICY "Users can view fraud alerts for their posts" 
ON public.fraud_alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = fraud_alerts.post_id 
    AND posts.user_id = auth.uid()
  ) OR 
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'fraud_detector')
);

CREATE POLICY "Fraud detectors can insert alerts" 
ON public.fraud_alerts 
FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'fraud_detector') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Fraud detectors can update alerts" 
ON public.fraud_alerts 
FOR UPDATE 
USING (
  public.has_role(auth.uid(), 'fraud_detector') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Create a fraud detector user account (you'll need to create this manually in Supabase Auth)
-- This is just a placeholder for documentation - you'll need to create the actual user
-- Then assign the fraud_detector role to that user

-- Example: After creating the fraud detector user, assign the role
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('YOUR_FRAUD_DETECTOR_USER_UUID', 'fraud_detector');