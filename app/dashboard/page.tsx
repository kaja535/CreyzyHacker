import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Target, 
  Trophy, 
  Terminal as TerminalIcon, 
  TrendingUp,
  ChevronRight,
  Shield,
  Zap
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, rank, total_points')
    .eq('id', user?.id || '')
    .single()

  // Fetch challenges stats
  const { data: challenges } = await supabase
    .from('challenges')
    .select('id, points')
    .eq('is_active', true)

  // Fetch user progress
  const { data: progress } = await supabase
    .from('user_progress')
    .select('challenge_id, status, points_earned')
    .eq('user_id', user?.id || '')

  const totalChallenges = challenges?.length || 0
  const completedChallenges = progress?.filter(p => p.status === 'completed').length || 0
  const totalPoints = challenges?.reduce((sum, c) => sum + c.points, 0) || 0
  const earnedPoints = profile?.total_points || 0

  // Get recent activity
  const { data: recentCommands } = await supabase
    .from('command_history')
    .select('command, executed_at')
    .eq('user_id', user?.id || '')
    .order('executed_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold font-mono text-foreground">
            {">"} Welcome back, <span className="text-primary">{profile?.username || 'Hacker'}</span>
          </h1>
          <p className="text-muted-foreground font-mono mt-1">
            Ready to hack? Your command center awaits.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground font-mono">Current Rank</p>
          <p className="text-xl font-bold text-primary font-mono">{profile?.rank || 'Rookie'}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground">
              Total Points
            </CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {earnedPoints}
              <span className="text-sm text-muted-foreground ml-1">
                / {totalPoints}
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground">
              Challenges Completed
            </CardTitle>
            <Target className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {completedChallenges}
              <span className="text-sm text-muted-foreground ml-1">
                / {totalChallenges}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-2">
              {totalChallenges - completedChallenges} remaining
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground">
              Current Streak
            </CardTitle>
            <Zap className="h-4 w-4 text-terminal-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {completedChallenges > 0 ? '1' : '0'}
              <span className="text-sm text-muted-foreground ml-1">days</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-2">
              Keep hacking daily!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-mono text-muted-foreground">
              Rank Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              {profile?.rank || 'Rookie'}
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-2">
              {earnedPoints < 500 ? `${500 - earnedPoints} pts to Script Kiddie` : 'Keep climbing!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/challenges">
              <Button variant="outline" className="w-full justify-between font-mono group">
                <div className="flex items-center gap-3">
                  <Target className="h-4 w-4 text-primary" />
                  Start a Challenge
                </div>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/dashboard/terminal">
              <Button variant="outline" className="w-full justify-between font-mono group">
                <div className="flex items-center gap-3">
                  <TerminalIcon className="h-4 w-4 text-accent" />
                  Open Terminal
                </div>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/dashboard/leaderboard">
              <Button variant="outline" className="w-full justify-between font-mono group">
                <div className="flex items-center gap-3">
                  <Trophy className="h-4 w-4 text-terminal-warning" />
                  View Leaderboard
                </div>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-mono flex items-center gap-2">
              <TerminalIcon className="h-5 w-5 text-accent" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentCommands && recentCommands.length > 0 ? (
              <div className="space-y-2 font-mono text-sm">
                {recentCommands.map((cmd, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-terminal-bg rounded"
                  >
                    <code className="text-terminal-prompt">$ {cmd.command}</code>
                    <span className="text-xs text-muted-foreground">
                      {new Date(cmd.executed_at).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TerminalIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-mono text-sm">
                  No recent activity
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start hacking to see your commands here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
