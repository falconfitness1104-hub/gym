-- 1. HEALTH METRICS TABLE
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  steps integer DEFAULT 0,
  calories_burned float DEFAULT 0,
  distance_meters float DEFAULT 0,
  heart_rate_avg float,
  sleep_minutes integer,
  source text, -- 'apple_health' or 'google_health'
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT health_metrics_pkey PRIMARY KEY (id),
  CONSTRAINT health_metrics_user_date_key UNIQUE (user_id, date)
);

-- 2. ENABLE RLS
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES
CREATE POLICY "Users can manage own health metrics." ON health_metrics FOR ALL USING (auth.uid() = user_id);
