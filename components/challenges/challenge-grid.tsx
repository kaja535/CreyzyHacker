'use client'

import { ChallengeCard } from './challenge-card'

interface Challenge {
  id: string
  name: string
  description: string
  category: string
  difficulty: string
  points: number
  machine_ip: string
  hints: string[]
  status: string
  completed_at: string | null
}

interface ChallengeGridProps {
  challenges: Challenge[]
}

export function ChallengeGrid({ challenges }: ChallengeGridProps) {
  // Group challenges by category
  const categories = challenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) {
      acc[challenge.category] = []
    }
    acc[challenge.category].push(challenge)
    return acc
  }, {} as Record<string, Challenge[]>)

  const categoryOrder = ['Network', 'Web', 'Crypto', 'Forensics', 'Binary', 'Mixed']
  const sortedCategories = Object.entries(categories).sort(
    ([a], [b]) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  )

  return (
    <div className="space-y-8">
      {sortedCategories.map(([category, categoryChalllenges]) => (
        <div key={category}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-lg font-mono font-bold text-primary">
              [{category.toUpperCase()}]
            </h2>
            <div className="h-px flex-1 bg-border" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryChalllenges.map(challenge => (
              <ChallengeCard key={challenge.id} challenge={challenge} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
