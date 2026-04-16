'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Terminal, 
  Globe, 
  Lock, 
  Search, 
  Binary, 
  Layers,
  CheckCircle,
  Play,
  Server
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Challenge {
  id: string
  name: string
  description: string
  category: string
  difficulty: string
  points: number
  machine_ip: string
  status: string
  completed_at: string | null
}

interface ChallengeCardProps {
  challenge: Challenge
}

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

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const isCompleted = challenge.status === 'completed'

  return (
    <Card className={cn(
      "bg-card border-border hover:border-primary/50 transition-colors relative overflow-hidden group",
      isCompleted && "border-primary/30 bg-primary/5"
    )}>
      {isCompleted && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isCompleted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {categoryIcons[challenge.category] || <Terminal className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-mono text-foreground truncate">
              {challenge.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={difficultyColors[challenge.difficulty]}>
                {challenge.difficulty}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {challenge.points} pts
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {challenge.description}
        </p>
        
        <div className="flex items-center justify-between">
          <code className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded">
            {challenge.machine_ip}
          </code>
          
          <Link href={`/dashboard/challenges/${challenge.id}`}>
            <Button 
              size="sm" 
              className={cn(
                "font-mono",
                isCompleted 
                  ? "bg-primary/20 text-primary hover:bg-primary/30" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  REVIEW
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  HACK
                </>
              )}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
