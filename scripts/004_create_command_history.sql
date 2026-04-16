-- Create command_history table (for analytics)
CREATE TABLE IF NOT EXISTS command_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id),
  command TEXT NOT NULL,
  output TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE command_history ENABLE ROW LEVEL SECURITY;

-- Users can only access their own command history
CREATE POLICY "command_history_select_own" ON command_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "command_history_insert_own" ON command_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create leaderboard view
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  p.id,
  p.username,
  p.avatar_url,
  p.rank,
  p.total_points,
  COUNT(up.id) FILTER (WHERE up.status = 'completed') as challenges_completed
FROM profiles p
LEFT JOIN user_progress up ON p.id = up.user_id
GROUP BY p.id, p.username, p.avatar_url, p.rank, p.total_points
ORDER BY p.total_points DESC;
