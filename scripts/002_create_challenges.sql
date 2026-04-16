-- Create challenges table (CTF machines)
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Insane')),
  category TEXT,
  points INTEGER NOT NULL,
  flag TEXT NOT NULL,
  hints JSONB DEFAULT '[]',
  filesystem JSONB DEFAULT '{}',
  services JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

-- Everyone can read active challenges
CREATE POLICY "challenges_select_active" ON challenges FOR SELECT USING (is_active = true);
