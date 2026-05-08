-- 1. ENHANCE PROFILES for accurate health calculations
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birthdate DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS activity_level TEXT; -- sedentary, light, moderate, active, extra_active

-- 2. TARGET GOALS for personalized tracking
CREATE TABLE IF NOT EXISTS public.user_goals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  target_weight numeric,
  target_calories integer,
  target_protein integer,
  target_carbs integer,
  target_fat integer,
  daily_water_target_ml integer DEFAULT 2000,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_goals_pkey PRIMARY KEY (id),
  CONSTRAINT user_goals_user_id_key UNIQUE (user_id)
);

-- 3. WORKOUT TRACKING SYSTEM
-- Master list of exercises
CREATE TABLE IF NOT EXISTS public.exercises (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  muscle_group text,
  equipment text,
  instructions text,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exercises_pkey PRIMARY KEY (id)
);

-- User workout sessions
CREATE TABLE IF NOT EXISTS public.workouts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  duration_minutes integer,
  calories_burned integer,
  notes text,
  scheduled_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT workouts_pkey PRIMARY KEY (id)
);

-- Detailed logs of each set
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  workout_id uuid REFERENCES public.workouts(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES public.exercises(id),
  set_number integer NOT NULL,
  reps integer,
  weight_kg numeric,
  rest_seconds integer,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT workout_logs_pkey PRIMARY KEY (id)
);

-- 4. ENABLE RLS
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES
CREATE POLICY "Users can manage own goals." ON user_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Exercises are viewable by everyone." ON exercises FOR SELECT USING (true);
CREATE POLICY "Users can manage own workouts." ON workouts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own workout logs." ON workout_logs FOR ALL 
  USING (EXISTS (SELECT 1 FROM workouts WHERE workouts.id = workout_logs.workout_id AND workouts.user_id = auth.uid()));

-- 6. SEED SOME BASIC EXERCISES
INSERT INTO public.exercises (name, muscle_group, equipment) VALUES
('Bench Press', 'Chest', 'Barbell'),
('Squat', 'Legs', 'Barbell'),
('Deadlift', 'Back/Legs', 'Barbell'),
('Pull Up', 'Back', 'Bodyweight'),
('Shoulder Press', 'Shoulders', 'Dumbbell'),
('Bicep Curl', 'Arms', 'Dumbbell');
