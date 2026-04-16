import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Award, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch leaderboard
  const { data: leaderboard } = await supabase
    .from('profiles')
    .select('id, username, rank, total_points, avatar_url')
    .order('total_points', { ascending: false })
    .limit(50)

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-mono text-muted-foreground">#{position}</span>
    }
  }

  const getRankStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-yellow-500/10 border-yellow-500/30'
      case 2:
        return 'bg-gray-400/10 border-gray-400/30'
      case 3:
        return 'bg-amber-600/10 border-amber-600/30'
      default:
        return 'bg-card border-border'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono text-foreground flex items-center gap-3">
          <Trophy className="h-7 w-7 text-primary" />
          {">"} LEADERBOARD
        </h1>
        <p className="text-muted-foreground font-mono text-sm mt-1">
          Top hackers ranked by total points earned
        </p>
      </div>

      {/* Top 3 podium */}
      {leaderboard && leaderboard.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd place */}
          <Card className={cn("mt-8", getRankStyle(2))}>
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-3">
                {getRankIcon(2)}
              </div>
              <Avatar className="h-16 w-16 mx-auto border-2 border-gray-400/50">
                <AvatarImage src={leaderboard[1]?.avatar_url || undefined} />
                <AvatarFallback className="bg-gray-400/20 text-gray-400 font-mono text-lg">
                  {leaderboard[1]?.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="mt-3 font-mono font-bold text-foreground">
                {leaderboard[1]?.username}
              </p>
              <p className="text-sm text-muted-foreground">
                {leaderboard[1]?.rank}
              </p>
              <p className="text-lg font-bold text-primary font-mono mt-2">
                {leaderboard[1]?.total_points} pts
              </p>
            </CardContent>
          </Card>

          {/* 1st place */}
          <Card className={cn("", getRankStyle(1))}>
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-3">
                {getRankIcon(1)}
              </div>
              <Avatar className="h-20 w-20 mx-auto border-2 border-yellow-500/50">
                <AvatarImage src={leaderboard[0]?.avatar_url || undefined} />
                <AvatarFallback className="bg-yellow-500/20 text-yellow-500 font-mono text-xl">
                  {leaderboard[0]?.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="mt-3 font-mono font-bold text-foreground text-lg">
                {leaderboard[0]?.username}
              </p>
              <p className="text-sm text-muted-foreground">
                {leaderboard[0]?.rank}
              </p>
              <p className="text-xl font-bold text-primary font-mono mt-2">
                {leaderboard[0]?.total_points} pts
              </p>
            </CardContent>
          </Card>

          {/* 3rd place */}
          <Card className={cn("mt-12", getRankStyle(3))}>
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center mb-3">
                {getRankIcon(3)}
              </div>
              <Avatar className="h-14 w-14 mx-auto border-2 border-amber-600/50">
                <AvatarImage src={leaderboard[2]?.avatar_url || undefined} />
                <AvatarFallback className="bg-amber-600/20 text-amber-600 font-mono">
                  {leaderboard[2]?.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="mt-3 font-mono font-bold text-foreground">
                {leaderboard[2]?.username}
              </p>
              <p className="text-sm text-muted-foreground">
                {leaderboard[2]?.rank}
              </p>
              <p className="text-lg font-bold text-primary font-mono mt-2">
                {leaderboard[2]?.total_points} pts
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rest of leaderboard */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-mono text-lg">All Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard?.map((player, index) => (
              <div
                key={player.id}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg transition-colors",
                  player.id === user?.id 
                    ? "bg-primary/10 border border-primary/30" 
                    : "hover:bg-muted/50"
                )}
              >
                <div className="w-10 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>
                
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={player.avatar_url || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground font-mono">
                    {player.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-mono font-bold text-foreground truncate">
                    {player.username}
                    {player.id === user?.id && (
                      <span className="text-primary text-xs ml-2">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{player.rank}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold font-mono text-primary">
                    {player.total_points}
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}

            {(!leaderboard || leaderboard.length === 0) && (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground font-mono">
                  No rankings yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete challenges to appear on the leaderboard
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
