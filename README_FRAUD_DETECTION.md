# Fraud Detection Service

## Overview
`fraud_detection_app.py` is a Flask service that runs server-side fraud checks against the Supabase database and writes alerts to `fraud_alerts`.

## Requirements
- Python 3.10+
- A Supabase project with the tables and RLS policies in `supabase/migrations`

## Environment Variables
Set these before running the service:

- `SUPABASE_URL` - your Supabase project URL (ex: `https://your-project-id.supabase.co`)
- `SUPABASE_SERVICE_KEY` - service role key (server-side only)

## Run Locally
```bash
pip install flask supabase python-dotenv
python fraud_detection_app.py
```

## Endpoints
- `POST /api/detect_fraud` - runs all fraud detection checks
- `GET /api/fraud_alerts` - returns all alerts (joined with post/profile data)
- `POST /api/fraud_alerts/{alert_id}/resolve` - resolves an alert

## Detection Rules
- Suspicious engagement: engagement rate > 15% and > 100 total engagements
- Rapid earnings growth: earnings > $50 per 1k views and > $100 total
- Suspicious account pattern: > 50% posts frozen (min 3 posts)
- Low quality content: grade D/F, engagement score < 30, or originality flagged

## Notes
- The service uses the Supabase service role key, so run it in a trusted environment only.
- Configure a scheduler (cron/job runner) to call `/api/detect_fraud` periodically.
