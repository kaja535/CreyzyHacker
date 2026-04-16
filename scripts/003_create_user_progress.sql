-- Create user_progress table (tracks completions)
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  hints_used INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, challenge_id)
);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Users can only access their own progress
CREATE POLICY "user_progress_select_own" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_progress_insert_own" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_progress_update_own" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_progress_delete_own" ON user_progress FOR DELETE USING (auth.uid() = user_id);
