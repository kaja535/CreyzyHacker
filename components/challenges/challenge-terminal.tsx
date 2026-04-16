'use client'

import { useState } from 'react'
import { Terminal } from '@/components/terminal/terminal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Lightbulb, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle,
  Trophy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface ChallengeTerminalProps {
  challengeId: string
  challengeName: string
  machineIp: string
  hints: string[]
  isCompleted: boolean
  hintsUsed: number
}

export function ChallengeTerminal({
  challengeId,
  challengeName,
  machineIp,
  hints,
  isCompleted: initialCompleted,
  hintsUsed: initialHintsUsed,
}: ChallengeTerminalProps) {
  const [showHints, setShowHints] = useState(false)
  const [revealedHints, setRevealedHints] = useState(initialHintsUsed)
  const [isCompleted, setIsCompleted] = useState(initialCompleted)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleFlagFound = (flag: string) => {
    if (!isCompleted) {
      setIsCompleted(true)
      setShowSuccess(true)
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00ff80', '#00d4aa', '#00a86b'],
      })
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }

  const revealHint = () => {
    if (revealedHints < hints.length) {
      setRevealedHints(prev => prev + 1)
      // TODO: Update hints_used in database
    }
  }

  return (
    <div className="space-y-4">
      {/* Success banner */}
      {showSuccess && (
        <div className="bg-primary/20 border border-primary rounded-lg p-4 flex items-center gap-4 animate-in slide-in-from-top">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h3 className="font-bold font-mono text-primary">FLAG CAPTURED!</h3>
            <p className="text-sm text-foreground">
              Congratulations! You have successfully completed {challengeName}.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Terminal */}
        <div className="lg:col-span-3">
          <Terminal
            challengeId={challengeId}
            machineName={challengeName}
            machineIp={machineIp}
            onFlagFound={handleFlagFound}
            className="h-[500px]"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                {isCompleted ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span className="text-primary">COMPLETED</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-terminal-warning animate-pulse" />
                    <span className="text-terminal-warning">IN_PROGRESS</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Hints */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex items-center justify-between w-full text-left"
              >
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-terminal-warning" />
                  HINTS ({revealedHints}/{hints.length})
                </CardTitle>
                {showHints ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </CardHeader>
            
            {showHints && (
              <CardContent className="space-y-3">
                {hints.slice(0, revealedHints).map((hint, index) => (
                  <div
                    key={index}
                    className="p-2 bg-terminal-warning/10 border border-terminal-warning/30 rounded text-sm text-foreground"
                  >
                    <span className="text-terminal-warning font-mono">
                      [{index + 1}]
                    </span>{' '}
                    {hint}
                  </div>
                ))}
                
                {revealedHints < hints.length && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={revealHint}
                    className="w-full font-mono text-terminal-warning border-terminal-warning/30 hover:bg-terminal-warning/10"
                  >
                    REVEAL_HINT ({hints.length - revealedHints} left)
                  </Button>
                )}
                
                {revealedHints === 0 && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Using hints will reduce your score.
                  </p>
                )}
              </CardContent>
            )}
          </Card>

          {/* Quick commands */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono">QUICK_COMMANDS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { cmd: 'nmap', desc: 'Scan ports' },
                { cmd: 'ssh', desc: 'Connect' },
                { cmd: 'cat', desc: 'Read file' },
                { cmd: 'submit', desc: 'Submit flag' },
              ].map(({ cmd, desc }) => (
                <div
                  key={cmd}
                  className="flex items-center justify-between text-xs"
                >
                  <code className="text-primary font-mono">{cmd}</code>
                  <span className="text-muted-foreground">{desc}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
