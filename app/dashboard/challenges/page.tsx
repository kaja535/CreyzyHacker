import { createClient } from '@/lib/supabase/server'
import { ChallengeGrid } from '@/components/challenges/challenge-grid'

export default async function ChallengesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch all challenges
  const { data: challenges } = await supabase
    .from('challenges')
    .select('id, name, description, category, difficulty, points, machine_ip, hints')
    .eq('is_active', true)
    .order('points', { ascending: true })
  
  // Fetch user progress
  const { data: progress } = await supabase
    .from('user_progress')
    .select('challenge_id, status, completed_at, points_earned')
    .eq('user_id', user?.id || '')
  
  // Create a map of progress by challenge_id
  const progressMap = new Map(
    progress?.map(p => [p.challenge_id, p]) || []
  )
  
  // Merge challenges with progress
  const challengesWithProgress = challenges?.map(challenge => ({
    ...challenge,
    status: progressMap.get(challenge.id)?.status || 'not_started',
    completed_at: progressMap.get(challenge.id)?.completed_at || null,
  })) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground">
          {">"} CTF_CHALLENGES
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Select a target machine and hack your way to the flag
        </p>
      </div>
      
      <ChallengeGrid challenges={challengesWithProgress} />
    </div>
  )
}
