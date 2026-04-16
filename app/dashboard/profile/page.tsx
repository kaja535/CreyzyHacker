import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Trophy, 
  Target, 
  Calendar,
  Shield,
  Star
} from 'lucide-react'

const rankThresholds = [
  { name: 'Rookie', min: 0, color: 'text-muted-foreground' },
  { name: 'Script Kiddie', min: 500, color: 'text-terminal-warning' },
  { name: 'Hacker', min: 1000, color: 'text-primary' },
  { name: 'Elite Hacker', min: 2000, color: 'text-accent' },
  { name: 'Master', min: 3500, color: 'text-destructive' },
]

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id || '')
    .single()

  // Fetch completed challenges
  const { data: completedChallenges } = await supabase
    .from('user_progress')
    .select(`
      challenge_id,
      completed_at,
      points_earned,
      challenges (name, category, difficulty)
    `)
    .eq('user_id', user?.id || '')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  // Calculate current rank and next rank
  const currentPoints = profile?.total_points || 0
  const currentRankInfo = rankThresholds.reduce((acc, rank) => 
    currentPoints >= rank.min ? rank : acc
  , rankThresholds[0])
  
  const nextRankIndex = rankThresholds.findIndex(r => r.name === currentRankInfo.name) + 1
  const nextRank = nextRankIndex < rankThresholds.length ? rankThresholds[nextRankIndex] : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground flex items-center gap-3">
          <User className="h-7 w-7 text-primary" />
          {">"} PROFILE
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Your hacker identity and achievements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <Avatar className="h-24 w-24 mx-auto border-2 border-primary/30">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-mono text-2xl">
                  {profile?.username?.substring(0, 2).toUpperCase() || '??'}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="mt-4 text-xl font-bold font-mono text-foreground">
                {profile?.username || 'Unknown Hacker'}
              </h2>
              
              <Badge className={`mt-2 ${currentRankInfo.color} bg-transparent border`}>
                {currentRankInfo.name}
              </Badge>
              
              <p className="mt-4 text-sm text-muted-foreground font-mono">
                {user?.email}
              </p>
              
              <div className="mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold font-mono text-primary">
                      {currentPoints}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Points</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold font-mono text-accent">
                      {completedChallenges?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>

              {/* Rank progress */}
              {nextRank && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground font-mono mb-2">
                    Progress to {nextRank.name}
                  </p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all"
                      style={{ 
                        width: `${Math.min(100, ((currentPoints - currentRankInfo.min) / (nextRank.min - currentRankInfo.min)) * 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-2">
                    {nextRank.min - currentPoints} points to go
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats and achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-4 text-center">
                <Trophy className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-lg font-bold font-mono">{currentPoints}</p>
                <p className="text-xs text-muted-foreground">Points</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-4 text-center">
                <Target className="h-6 w-6 mx-auto text-accent mb-2" />
                <p className="text-lg font-bold font-mono">{completedChallenges?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Challenges</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-4 text-center">
                <Shield className="h-6 w-6 mx-auto text-terminal-warning mb-2" />
                <p className="text-lg font-bold font-mono">
                  {rankThresholds.findIndex(r => r.name === currentRankInfo.name) + 1}
                </p>
                <p className="text-xs text-muted-foreground">Rank Level</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-border">
              <CardContent className="pt-4 text-center">
                <Calendar className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-lg font-bold font-mono">
                  {profile?.created_at 
                    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                    : 'N/A'
                  }
                </p>
                <p className="text-xs text-muted-foreground">Joined</p>
              </CardContent>
            </Card>
          </div>

          {/* Completed challenges */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-mono flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Completed Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completedChallenges && completedChallenges.length > 0 ? (
                <div className="space-y-3">
                  {completedChallenges.map((progress: any) => (
                    <div
                      key={progress.challenge_id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div>
                        <p className="font-mono font-bold text-foreground">
                          {progress.challenges?.name || 'Unknown Challenge'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {progress.challenges?.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {progress.challenges?.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-primary">
                          +{progress.points_earned}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {progress.completed_at 
                            ? new Date(progress.completed_at).toLocaleDateString()
                            : ''
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-mono">
                    No completed challenges yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start hacking to earn your first achievement
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
