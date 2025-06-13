'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, Sun, Moon, Sunset } from 'lucide-react'
import { format, startOfWeek, addDays } from 'date-fns'
import { toast } from '@/hooks/use-toast'

import { logger } from '@/lib/logger'
interface WorkerScheduleProps {
  schedule: Array<{
    workerId: string
    date: Date
    isAvailable: boolean
    shift: 'morning' | 'afternoon' | 'evening' | null
    notes?: string
  }>
  workerId: string
}

const SHIFT_CONFIG = {
  morning: { icon: Sun, label: 'Morning', time: '6:00 AM - 2:00 PM', color: 'bg-yellow-500' },
  afternoon: { icon: Sunset, label: 'Afternoon', time: '2:00 PM - 10:00 PM', color: 'bg-orange-500' },
  evening: { icon: Moon, label: 'Evening', time: '10:00 PM - 6:00 AM', color: 'bg-indigo-500' },
}

export function WorkerSchedule({ schedule, workerId }: WorkerScheduleProps) {
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [tempSchedule, setTempSchedule] = useState(schedule)
  const [isSaving, setIsSaving] = useState(false)

  const handleUpdate = (index: number, updates: Partial<typeof schedule[0]>) => {
    const newSchedule = [...tempSchedule]
    newSchedule[index] = { ...newSchedule[index], ...updates }
    setTempSchedule(newSchedule)
  }

  const saveDay = async (index: number) => {
    setIsSaving(true)
    try {
      const day = tempSchedule[index]
      const response = await fetch('/api/worker/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: day.date,
          isAvailable: day.isAvailable,
          shift: day.shift,
          notes: day.notes,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Schedule updated successfully',
        })
        setEditingDay(null)
      }
    } catch (error) {
      logger.error('Error updating schedule:', error)
      toast({
        title: 'Error',
        description: 'Failed to update schedule',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getDayStatus = (day: typeof schedule[0]) => {
    if (!day.isAvailable) return 'Unavailable'
    if (!day.shift) return 'Available'
    return SHIFT_CONFIG[day.shift].label
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tempSchedule.map((day, index) => {
              const isEditing = editingDay === index
              const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6
              const ShiftIcon = day.shift ? SHIFT_CONFIG[day.shift].icon : Calendar

              return (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg border ${
                    isWeekend ? 'bg-zinc-900/50' : 'bg-zinc-900'
                  } ${isEditing ? 'border-primary' : 'border-zinc-800'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {format(day.date, 'd')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(day.date, 'EEE')}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <ShiftIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{getDayStatus(day)}</p>
                          {day.shift && day.isAvailable && (
                            <p className="text-sm text-muted-foreground">
                              {SHIFT_CONFIG[day.shift].time}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingDay(index)}
                      >
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => saveDay(index)}
                          disabled={isSaving}
                        >
                          {isSaving ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingDay(null)
                            setTempSchedule(schedule)
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`available-${index}`}
                          checked={day.isAvailable}
                          onCheckedChange={(checked) => 
                            handleUpdate(index, { isAvailable: checked })
                          }
                        />
                        <Label htmlFor={`available-${index}`}>Available to work</Label>
                      </div>

                      {day.isAvailable && (
                        <div>
                          <Label>Shift Preference</Label>
                          <Select
                            value={day.shift || ''}
                            onValueChange={(value) => 
                              handleUpdate(index, { shift: value as any })
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select shift" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">
                                <div className="flex items-center gap-2">
                                  <Sun className="h-4 w-4" />
                                  Morning (6 AM - 2 PM)
                                </div>
                              </SelectItem>
                              <SelectItem value="afternoon">
                                <div className="flex items-center gap-2">
                                  <Sunset className="h-4 w-4" />
                                  Afternoon (2 PM - 10 PM)
                                </div>
                              </SelectItem>
                              <SelectItem value="evening">
                                <div className="flex items-center gap-2">
                                  <Moon className="h-4 w-4" />
                                  Evening (10 PM - 6 AM)
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div>
                        <Label>Notes (Optional)</Label>
                        <Textarea
                          value={day.notes || ''}
                          onChange={(e) => 
                            handleUpdate(index, { notes: e.target.value })
                          }
                          placeholder="Any special notes for this day..."
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}

                  {day.notes && !isEditing && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Note: {day.notes}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Shift Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Shift Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(SHIFT_CONFIG).map(([shift, config]) => {
              const count = tempSchedule.filter(d => 
                d.isAvailable && d.shift === shift
              ).length
              
              return (
                <div key={shift} className="text-center p-4 bg-zinc-900 rounded-lg">
                  <config.icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="font-medium">{config.label}</p>
                  <p className="text-2xl font-bold mt-1">{count}</p>
                  <p className="text-xs text-muted-foreground">days this week</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}