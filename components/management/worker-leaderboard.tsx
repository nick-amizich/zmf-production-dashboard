'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award } from 'lucide-react'

interface WorkerLeaderboardProps {
  leaderboard: Array<{
    worker: any
    score: number
    unitsCompleted: number
    qualityRate: number
    efficiency: number
  }>
}

export function WorkerLeaderboard({ leaderboard }: WorkerLeaderboardProps) {
  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1: return <Medal className="h-5 w-5 text-theme-text-tertiary" />
      case 2: return <Award className="h-5 w-5 text-orange-600" />
      default: return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {leaderboard.slice(0, 5).map((entry, index) => (
            <div 
              key={entry.worker.id} 
              className={`flex items-center justify-between p-3 rounded-lg ${
                index < 3 ? 'bg-zinc-900' : 'bg-zinc-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8">
                  {getMedalIcon(index) || (
                    <span className="text-lg font-bold text-zinc-500">
                      {index + 1}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium">{entry.worker.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.unitsCompleted} units • {entry.qualityRate.toFixed(1)}% quality
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{entry.score.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}