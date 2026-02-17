-- Seed data for Creator Sparks
--
-- Requires at least one auth user. Create a user first, then run this file.
-- The seed inserts demo data for the first auth user found.

-- Profile
WITH seed_user AS (
  SELECT id FROM auth.users ORDER BY created_at LIMIT 1
)
INSERT INTO public.profiles (
  user_id,
  username,
  display_name,
  avatar_url,
  bio,
  followers_count,
  following_count,
  total_earnings
)
SELECT
  seed_user.id,
  'creator_user',
  'Creator Sparks',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'Creator building a data-driven content strategy.',
  125400,
  890,
  1740.00
FROM seed_user
ON CONFLICT (user_id) DO NOTHING;

-- Posts
WITH seed_user AS (
  SELECT id FROM auth.users ORDER BY created_at LIMIT 1
)
INSERT INTO public.posts (
  id,
  user_id,
  title,
  description,
  video_url,
  thumbnail_url,
  duration,
  views_count,
  likes_count,
  comments_count,
  shares_count,
  saves_count,
  base_pay,
  bonus_multiplier,
  total_earnings,
  is_frozen,
  freeze_reason,
  posted_at
)
SELECT
  v.id,
  seed_user.id,
  v.title,
  v.description,
  v.video_url,
  v.thumbnail_url,
  v.duration,
  v.views_count,
  v.likes_count,
  v.comments_count,
  v.shares_count,
  v.saves_count,
  v.base_pay,
  v.bonus_multiplier,
  v.total_earnings,
  v.is_frozen,
  v.freeze_reason,
  v.posted_at
FROM seed_user
JOIN (
  VALUES
    (
      '11111111-1111-1111-1111-111111111111',
      'Morning Coffee Run',
      'Starting the day with a quick coffee run and a calm routine.',
      'https://example.com/videos/morning-coffee-run.mp4',
      '/thumbnails/morning-coffee-run.jpg',
      45,
      892000,
      45200,
      1200,
      8900,
      3400,
      500.00,
      0.20,
      600.00,
      false,
      NULL,
      now() - interval '20 days'
    ),
    (
      '22222222-2222-2222-2222-222222222222',
      'City Life Adventure',
      'Exploring the city on a fast-paced weekend adventure.',
      'https://example.com/videos/city-life-adventure.mp4',
      '/thumbnails/city-life-adventure.jpg',
      38,
      456000,
      28900,
      890,
      5600,
      2100,
      800.00,
      0.10,
      880.00,
      false,
      NULL,
      now() - interval '40 days'
    ),
    (
      '33333333-3333-3333-3333-333333333333',
      'Dance Challenge',
      'Trending dance challenge with fast cuts and high energy.',
      'https://example.com/videos/dance-challenge.mp4',
      '/thumbnails/dance-challenge.jpg',
      52,
      234000,
      18700,
      650,
      3200,
      1500,
      400.00,
      0.10,
      440.00,
      true,
      'Fraudulent activity detected - contact support to appeal',
      now() - interval '10 days'
    ),
    (
      '44444444-4444-4444-4444-444444444444',
      'Best Math Hack',
      'A fast math trick that makes mental math feel easy.',
      'https://example.com/videos/best-math-hack.mp4',
      '/thumbnails/math-hack.png',
      28,
      120000,
      8800,
      420,
      2100,
      900,
      95.00,
      0.15,
      109.25,
      false,
      NULL,
      now() - interval '7 days'
    ),
    (
      '55555555-5555-5555-5555-555555555555',
      'Our Latest Like',
      'Behind the scenes of a post that took off overnight.',
      'https://example.com/videos/our-latest-like.mp4',
      '/thumbnails/our-latest-like.png',
      33,
      180000,
      9200,
      380,
      2400,
      1100,
      85.00,
      0.25,
      106.25,
      false,
      NULL,
      now() - interval '2 days'
    ),
    (
      '66666666-6666-6666-6666-666666666666',
      'Sparked A Lot',
      'A quick story on how a small idea turned into a viral clip.',
      'https://example.com/videos/sparked-a-lot.mp4',
      '/thumbnails/sparked-a-lot.png',
      41,
      140000,
      7600,
      510,
      2600,
      1300,
      72.00,
      0.18,
      84.96,
      false,
      NULL,
      now() - interval '5 days'
    )
) AS v(
  id,
  title,
  description,
  video_url,
  thumbnail_url,
  duration,
  views_count,
  likes_count,
  comments_count,
  shares_count,
  saves_count,
  base_pay,
  bonus_multiplier,
  total_earnings,
  is_frozen,
  freeze_reason,
  posted_at
) ON true
ON CONFLICT (id) DO NOTHING;

-- Quality assessments
INSERT INTO public.quality_assessments (
  post_id,
  engagement_score,
  originality_score,
  video_quality_score,
  overall_grade,
  is_final,
  assessed_at
)
SELECT
  v.post_id,
  v.engagement_score,
  v.originality_score,
  v.video_quality_score,
  v.overall_grade,
  v.is_final,
  now() - v.assessed_offset
FROM (
  VALUES
    ('11111111-1111-1111-1111-111111111111', 0.30, true,  'good',      'A', false, interval '2 days'),
    ('22222222-2222-2222-2222-222222222222', 0.20, true,  'good',      'B', true,  interval '20 days'),
    ('33333333-3333-3333-3333-333333333333', 0.40, false, 'good',      'B', false, interval '3 days'),
    ('44444444-4444-4444-4444-444444444444', 0.35, true,  'excellent', 'A', false, interval '1 day'),
    ('55555555-5555-5555-5555-555555555555', 0.42, true,  'good',      'A', false, interval '1 day'),
    ('66666666-6666-6666-6666-666666666666', 0.38, true,  'good',      'A', false, interval '4 days')
) AS v(post_id, engagement_score, originality_score, video_quality_score, overall_grade, is_final, assessed_offset)
JOIN public.posts p ON p.id = v.post_id
ON CONFLICT DO NOTHING;

-- Fraud alerts
INSERT INTO public.fraud_alerts (
  post_id,
  alert_type,
  severity,
  description
)
SELECT
  v.post_id,
  v.alert_type,
  v.severity,
  v.description
FROM (
  VALUES
    (
      '33333333-3333-3333-3333-333333333333',
      'botting',
      'high',
      'Detected suspicious engagement patterns and potential bot activity.'
    )
) AS v(post_id, alert_type, severity, description)
JOIN public.posts p ON p.id = v.post_id
ON CONFLICT DO NOTHING;

-- Weekly earnings
INSERT INTO public.weekly_earnings (
  post_id,
  week_start,
  week_end,
  base_earnings,
  bonus_earnings,
  total_earnings
)
SELECT
  v.post_id,
  v.week_start,
  v.week_end,
  v.base_earnings,
  v.bonus_earnings,
  v.total_earnings
FROM (
  VALUES
    (
      '11111111-1111-1111-1111-111111111111',
      date_trunc('week', now() - interval '21 days'),
      date_trunc('week', now() - interval '21 days') + interval '6 days',
      125.00,
      25.00,
      150.00
    ),
    (
      '11111111-1111-1111-1111-111111111111',
      date_trunc('week', now() - interval '14 days'),
      date_trunc('week', now() - interval '14 days') + interval '6 days',
      200.00,
      40.00,
      240.00
    ),
    (
      '11111111-1111-1111-1111-111111111111',
      date_trunc('week', now() - interval '7 days'),
      date_trunc('week', now() - interval '7 days') + interval '6 days',
      175.00,
      35.00,
      210.00
    ),
    (
      '22222222-2222-2222-2222-222222222222',
      date_trunc('week', now() - interval '42 days'),
      date_trunc('week', now() - interval '42 days') + interval '6 days',
      200.00,
      20.00,
      220.00
    ),
    (
      '22222222-2222-2222-2222-222222222222',
      date_trunc('week', now() - interval '35 days'),
      date_trunc('week', now() - interval '35 days') + interval '6 days',
      180.00,
      18.00,
      198.00
    ),
    (
      '22222222-2222-2222-2222-222222222222',
      date_trunc('week', now() - interval '28 days'),
      date_trunc('week', now() - interval '28 days') + interval '6 days',
      160.00,
      16.00,
      176.00
    ),
    (
      '33333333-3333-3333-3333-333333333333',
      date_trunc('week', now() - interval '14 days'),
      date_trunc('week', now() - interval '14 days') + interval '6 days',
      0.00,
      0.00,
      0.00
    ),
    (
      '33333333-3333-3333-3333-333333333333',
      date_trunc('week', now() - interval '7 days'),
      date_trunc('week', now() - interval '7 days') + interval '6 days',
      200.00,
      20.00,
      220.00
    )
) AS v(post_id, week_start, week_end, base_earnings, bonus_earnings, total_earnings)
JOIN public.posts p ON p.id = v.post_id
ON CONFLICT DO NOTHING;
