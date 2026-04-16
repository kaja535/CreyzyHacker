import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ChallengeTerminal } from '@/components/challenges/challenge-terminal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Server, Globe, Lock, Search, Binary, Layers } from 'lucide-react'

const categoryIcons: Record<string, React.ReactNode> = {
  Network: <Server className="h-5 w-5" />,
  Web: <Globe className="h-5 w-5" />,
  Crypto: <Lock className="h-5 w-5" />,
  Forensics: <Search className="h-5 w-5" />,
  Binary: <Binary className="h-5 w-5" />,
  Mixed: <Layers className="h-5 w-5" />,
}

const difficultyColors: Record<string, string> = {
  Easy: 'bg-primary/20 text-primary border-primary/30',
  Medium: 'bg-terminal-warning/20 text-terminal-warning border-terminal-warning/30',
  Hard: 'bg-destructive/20 text-destructive border-destructive/30',
  Insane: 'bg-accent/20 text-accent border-accent/30',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ChallengePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch challenge details
  const { data: challenge, error } = await supabase
    .from('challenges')
    .select('id, name, description, category, difficulty, points, machine_ip, hints')
    .eq('id', id)
    .single()
  
  if (error || !challenge) {
    notFound()
  }
  
  // Fetch user progress for this challenge
  const { data: progress } = await supabase
    .from('user_progress')
    .select('status, completed_at, hints_used, attempts')
    .eq('user_id', user?.id || '')
    .eq('challenge_id', id)
    .single()

  const isCompleted = progress?.status === 'completed'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/challenges">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                {categoryIcons[challenge.category]}
              </div>
              <h1 className="text-2xl font-bold font-mono text-foreground">
                {challenge.name}
              </h1>
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className={difficultyColors[challenge.difficulty]}>
                {challenge.difficulty}
              </Badge>
              <span className="text-sm text-muted-foreground font-mono">
                {challenge.points} points
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                [{challenge.category}]
              </span>
            </div>
          </div>
        </div>

        {isCompleted && (
          <Badge className="bg-primary/20 text-primary border-primary/30 font-mono">
            COMPLETED
          </Badge>
        )}
      </div>

      {/* Description */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h2 className="text-sm font-mono text-muted-foreground mb-2">
          {">"} MISSION_BRIEFING
        </h2>
        <p className="text-foreground">{challenge.description}</p>
        
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-sm font-mono text-muted-foreground mb-2">
            {">"} TARGET_INFO
          </h3>
          <code className="text-primary font-mono bg-primary/10 px-3 py-1 rounded">
            {challenge.machine_ip}
          </code>
        </div>
      </div>

      {/* Terminal */}
      <ChallengeTerminal
        challengeId={challenge.id}
        challengeName={challenge.name}
        machineIp={challenge.machine_ip}
        hints={challenge.hints}
        isCompleted={isCompleted}
        hintsUsed={progress?.hints_used || 0}
      />
    </div>
  )
}
