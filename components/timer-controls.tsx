"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Pause, Square, Clock } from "lucide-react"

interface TimerControlsProps {
  estimatedTime: string
  onStart: () => void
  onPause: () => void
  onComplete: () => void
}

export function TimerControls({ estimatedTime, onStart, onPause, onComplete }: TimerControlsProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0) // seconds
  const [startTime, setStartTime] = useState<number | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, startTime])

  const handleStart = () => {
    setIsRunning(true)
    setStartTime(Date.now() - elapsed * 1000)
    onStart()
  }

  const handlePause = () => {
    setIsRunning(false)
    onPause()
  }

  const handleComplete = () => {
    setIsRunning(false)
    onComplete()
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="bg-theme-bg-secondary border-theme-border-primary">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-theme-text-secondary">
            <Clock className="h-5 w-5" />
            <span className="text-sm">Estimated: {estimatedTime}</span>
          </div>

          <div className="text-4xl font-bold text-theme-text-primary font-mono">{formatTime(elapsed)}</div>

          <div className="flex gap-3 justify-center">
            {!isRunning ? (
              <Button onClick={handleStart} size="lg" className="bg-theme-status-success hover:bg-green-700 text-theme-text-primary h-14 px-8">
                <Play className="h-6 w-6 mr-2" />
                Start
              </Button>
            ) : (
              <Button onClick={handlePause} size="lg" className="bg-theme-status-warning hover:bg-amber-700 text-theme-text-primary h-14 px-8">
                <Pause className="h-6 w-6 mr-2" />
                Pause
              </Button>
            )}

            <Button
              onClick={handleComplete}
              size="lg"
              className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary h-14 px-8"
            >
              <Square className="h-6 w-6 mr-2" />
              Complete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
