# Creator Sparks

Creator Sparks is a TikTok-style creator analytics dashboard built with Vite + React + Supabase. It includes a web app for creator earnings and post analytics, plus optional services for fraud detection and video originality analysis.

https://devpost.com/software/creator-sparks

## Features
- Email/password auth via Supabase
- Dashboard metrics: earnings, followers, views, and fraud alerts
- Post-level analytics and earnings breakdown
- Quality assessment + originality flags
- Optional fraud detection service (Python + Flask)
- Optional video originality analyzer (Python + FastAPI)

## Tech Stack
- Vite, React, TypeScript
- Tailwind CSS + shadcn-ui
- Supabase (Auth, Postgres, Edge Functions)
- Python (Flask, FastAPI) for optional services

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` from the example:
   ```bash
   cp .env.example .env
   ```
3. Set the required variables in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Start the dev server:
   ```bash
   npm run dev
   ```

## Supabase Setup
- Run the SQL in `supabase/migrations` in your Supabase project.
- The trigger for originality analysis calls the `analyze-originality` edge function using `pg_net`.
- If you use a different Supabase project, update the function URL in the trigger migrations and the `project_id` in `supabase/config.toml` (search for `your-project-id`).
- In `supabase/config.toml`, `verify_jwt = false` is enabled for the edge function. If you change this, update the trigger to include authorization.

### Optional Seed Data
- Create at least one Supabase auth user (sign up in the app or via the Supabase dashboard).
- Run `supabase/seed.sql` to insert demo profiles/posts using the first auth user.

### Edge Function Environment
Set these in your Supabase Edge Function environment:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ORIGINALITY_ANALYZER_URL` (ex: `http://localhost:8000`)

## Fraud Detection Service
See `README_FRAUD_DETECTION.md` for setup and endpoints.

## Video Originality Analyzer
The analyzer is in `video_originality_analyzer/` and exposes `/index` and `/analyze`.

```bash
cd video_originality_analyzer
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.app:app --reload --port 8000
```

## Data Model (Supabase)
- `profiles` - creator profile info
- `posts` - post metrics and earnings
- `quality_assessments` - engagement/originality scoring
- `fraud_alerts` - fraud signals and resolution status
- `weekly_earnings` - time-series earnings
- `user_roles` - role-based access

## Notes
- The earnings chart uses mock data in `src/components/EarningsChart.tsx`.
- Keep service role keys server-side only. Do not commit secrets.
