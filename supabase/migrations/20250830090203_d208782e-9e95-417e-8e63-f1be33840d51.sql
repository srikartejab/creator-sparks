-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  base_pay DECIMAL(10,2) DEFAULT 0,
  bonus_multiplier DECIMAL(3,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  is_frozen BOOLEAN DEFAULT FALSE,
  freeze_reason TEXT,
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quality assessments table
CREATE TABLE public.quality_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  engagement_score DECIMAL(3,2), -- 0.00 to 1.00
  originality_score BOOLEAN DEFAULT TRUE, -- original or not
  video_quality_score TEXT CHECK (video_quality_score IN ('poor', 'fair', 'good', 'excellent')),
  overall_grade TEXT CHECK (overall_grade IN ('A', 'B', 'C', 'D', 'F')),
  is_final BOOLEAN DEFAULT FALSE, -- true after 30 days
  assessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fraud alerts table
CREATE TABLE public.fraud_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'botting', 'suspicious_activity', etc.
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weekly earnings table for charts
CREATE TABLE public.weekly_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  base_earnings DECIMAL(10,2) DEFAULT 0,
  bonus_earnings DECIMAL(10,2) DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_earnings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for posts
CREATE POLICY "Users can view their own posts" 
ON public.posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts" 
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.posts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for quality assessments
CREATE POLICY "Users can view quality assessments for their posts" 
ON public.quality_assessments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = quality_assessments.post_id 
    AND posts.user_id = auth.uid()
  )
);

-- Create RLS policies for fraud alerts
CREATE POLICY "Users can view fraud alerts for their posts" 
ON public.fraud_alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = fraud_alerts.post_id 
    AND posts.user_id = auth.uid()
  )
);

-- Create RLS policies for weekly earnings
CREATE POLICY "Users can view weekly earnings for their posts" 
ON public.weekly_earnings 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = weekly_earnings.post_id 
    AND posts.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_posted_at ON public.posts(posted_at DESC);
CREATE INDEX idx_quality_assessments_post_id ON public.quality_assessments(post_id);
CREATE INDEX idx_fraud_alerts_post_id ON public.fraud_alerts(post_id);
CREATE INDEX idx_weekly_earnings_post_id ON public.weekly_earnings(post_id);
CREATE INDEX idx_weekly_earnings_week ON public.weekly_earnings(week_start, week_end);