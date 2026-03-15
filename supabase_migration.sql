-- =============================================
-- FORGEfit — Schema completo
-- Rodar no Supabase Dashboard > SQL Editor
-- =============================================

-- Perfil do usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  weight_kg NUMERIC(5,1),
  height_cm SMALLINT,
  birth_year SMALLINT,
  gender TEXT DEFAULT 'male',
  experience TEXT DEFAULT 'intermediate',
  profile_completed BOOLEAN DEFAULT FALSE,
  starting_weights JSONB DEFAULT '{}',
  rest_strength_seconds INT DEFAULT 90,
  rest_hypertrophy_seconds INT DEFAULT 60,
  notifications_enabled BOOLEAN DEFAULT FALSE,
  notification_time TIME DEFAULT '07:00',
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessões de treino
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_name TEXT NOT NULL,
  workout_type TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Séries registradas
CREATE TABLE IF NOT EXISTS exercise_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  set_number INT NOT NULL,
  planned_reps_min INT,
  planned_reps_max INT,
  actual_reps INT,
  weight_kg NUMERIC(5,2),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cache de mídia wger
CREATE TABLE IF NOT EXISTS wger_cache (
  exercise_id TEXT PRIMARY KEY,
  wger_id INT,
  images JSONB DEFAULT '[]',
  video_url TEXT,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Streak
CREATE TABLE IF NOT EXISTS streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_training_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Índices
-- =============================================
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON workout_sessions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sets_session ON exercise_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_sets_exercise ON exercise_sets(exercise_id);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE wger_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_own_profile" ON profiles;
CREATE POLICY "user_own_profile" ON profiles
  FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "user_own_sessions" ON workout_sessions;
CREATE POLICY "user_own_sessions" ON workout_sessions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_own_sets" ON exercise_sets;
CREATE POLICY "user_own_sets" ON exercise_sets
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM workout_sessions WHERE id = session_id)
  );

DROP POLICY IF EXISTS "user_own_streak" ON streaks;
CREATE POLICY "user_own_streak" ON streaks
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wger_cache_public_read" ON wger_cache;
CREATE POLICY "wger_cache_public_read" ON wger_cache
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "wger_cache_auth_write" ON wger_cache;
CREATE POLICY "wger_cache_auth_write" ON wger_cache
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "wger_cache_auth_update" ON wger_cache;
CREATE POLICY "wger_cache_auth_update" ON wger_cache
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- =============================================
-- Trigger: cria profile automaticamente ao registrar
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Migração: adicionar coluna gender (rodar se tabela já existe)
-- =============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'male';
