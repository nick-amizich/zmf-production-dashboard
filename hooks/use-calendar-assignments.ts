"use client"

import { useState, useCallback } from "react"
import type { CalendarAssignment, Worker } from "../types/calendar-assignments"

// Shared calendar assignment state
let globalAssignments: CalendarAssignment[] = []
let globalWorkers: Worker[] = [
  {
    id: "w1",
    name: "Tony Martinez",
    photo: "/placeholder.svg?height=40&width=40",
    primarySkill: "Intake",
    skillLevel: 3,
    weeklyCapacity: 40,
    scheduledHours: 32,
    available: true,
    stageAssignments: {
      Intake: 4,
      Sanding: 1,
      Finishing: 0,
      "Sub-Assembly": 0,
      "Final Assembly": 0,
      "Acoustic QC": 0,
      Shipping: 0,
    },
  },
  {
    id: "w2",
    name: "Jake Thompson",
    photo: "/placeholder.svg?height=40&width=40",
    primarySkill: "Sanding",
    skillLevel: 3,
    weeklyCapacity: 40,
    scheduledHours: 38,
    available: true,
    stageAssignments: {
      Intake: 0,
      Sanding: 4,
      Finishing: 0,
      "Sub-Assembly": 1,
      "Final Assembly": 0,
      "Acoustic QC": 0,
      Shipping: 0,
    },
  },
  {
    id: "w3",
    name: "Kevin Chen",
    photo: "/placeholder.svg?height=40&width=40",
    primarySkill: "Finishing",
    skillLevel: 3,
    weeklyCapacity: 40,
    scheduledHours: 28,
    available: true,
    stageAssignments: {
      Intake: 0,
      Sanding: 0,
      Finishing: 5,
      "Sub-Assembly": 0,
      "Final Assembly": 0,
      "Acoustic QC": 0,
      Shipping: 0,
    },
  },
  {
    id: "w4",
    name: "Matt Wilson",
    photo: "/placeholder.svg?height=40&width=40",
    primarySkill: "Acoustic QC",
    skillLevel: 3,
    weeklyCapacity: 40,
    scheduledHours: 36,
    available: true,
    stageAssignments: {
      Intake: 0,
      Sanding: 0,
      Finishing: 0,
      "Sub-Assembly": 0,
      "Final Assembly": 1,
      "Acoustic QC": 4,
      Shipping: 0,
    },
  },
  {
    id: "w5",
    name: "Stephen Davis",
    photo: "/placeholder.svg?height=40&width=40",
    primarySkill: "Intake",
    skillLevel: 2,
    weeklyCapacity: 40,
    scheduledHours: 24,
    available: true,
    stageAssignments: {
      Intake: 2,
      Sanding: 0,
      Finishing: 0,
      "Sub-Assembly": 0,
      "Final Assembly": 0,
      "Acoustic QC": 0,
      Shipping: 0,
    },
  },
  {
    id: "w6",
    name: "Laura Davis",
    photo: "/placeholder.svg?height=40&width=40",
    primarySkill: "Shipping",
    skillLevel: 3,
    weeklyCapacity: 40,
    scheduledHours: 30,
    available: true,
    stageAssignments: {
      Intake: 0,
      Sanding: 0,
      Finishing: 0,
      "Sub-Assembly": 0,
      "Final Assembly": 0,
      "Acoustic QC": 1,
      Shipping: 4,
    },
  },
  {
    id: "w7",
    name: "Sam Rodriguez",
    photo: "/placeholder.svg?height=40&width=40",
    primarySkill: "Assembly",
    skillLevel: 2,
    weeklyCapacity: 40,
    scheduledHours: 40,
    available: false,
    stageAssignments: {
      Intake: 0,
      Sanding: 1,
      Finishing: 0,
      "Sub-Assembly": 3,
      "Final Assembly": 1,
      "Acoustic QC": 0,
      Shipping: 0,
    },
  },
  {
    id: "w8",
    name: "Alex Johnson",
    photo: "/placeholder.svg?height=40&width=40",
    primarySkill: "Sanding",
    skillLevel: 1,
    weeklyCapacity: 40,
    scheduledHours: 20,
    available: true,
    stageAssignments: {
      Intake: 0,
      Sanding: 2,
      Finishing: 0,
      "Sub-Assembly": 0,
      "Final Assembly": 0,
      "Acoustic QC": 0,
      Shipping: 0,
    },
  },
]

const subscribers: Array<() => void> = []

// Helper function to safely convert date to string
const formatDateToString = (date: Date | string): string => {
  if (typeof date === "string") {
    return date.split("T")[0] // If already a string, just get the date part
  }
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toISOString().split("T")[0]
  }
  // Fallback to current date if invalid
  return new Date().toISOString().split("T")[0]
}

export function useCalendarAssignments() {
  const [, forceUpdate] = useState({})

  const triggerUpdate = useCallback(() => {
    forceUpdate({})
    subscribers.forEach((callback) => callback())
  }, [])

  const updateAssignments = useCallback(
    (newAssignments: CalendarAssignment[]) => {
      globalAssignments = newAssignments
      triggerUpdate()
    },
    [triggerUpdate],
  )

  const updateWorkers = useCallback(
    (newWorkers: Worker[]) => {
      globalWorkers = newWorkers
      triggerUpdate()
    },
    [triggerUpdate],
  )

  const moveAssignment = useCallback(
    (assignmentId: string, targetWorkerId: string, targetDate: string) => {
      globalAssignments = globalAssignments.map((assignment) =>
        assignment.id === assignmentId
          ? { ...assignment, workerId: targetWorkerId, date: formatDateToString(targetDate) }
          : assignment,
      )
      triggerUpdate()
    },
    [triggerUpdate],
  )

  const getAssignmentsForCell = useCallback((workerId: string, date: Date | string) => {
    const dateStr = formatDateToString(date)
    return globalAssignments.filter((assignment) => assignment.workerId === workerId && assignment.date === dateStr)
  }, [])

  const generateAssignmentsFromWorkers = useCallback(
    (startDate: Date) => {
      const newAssignments: CalendarAssignment[] = []
      const weekDays: Date[] = []

      // Generate 5 weekdays
      for (let i = 0; i < 5; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        weekDays.push(date)
      }

      globalWorkers.forEach((worker) => {
        if (!worker.stageAssignments) return

        let assignmentId = 1

        Object.entries(worker.stageAssignments).forEach(([stage, daysForStage]) => {
          if (daysForStage > 0) {
            const fullDays = Math.floor(daysForStage)
            const hasHalfDay = daysForStage % 1 !== 0

            // Add full days
            for (let dayIndex = 0; dayIndex < fullDays && dayIndex < weekDays.length; dayIndex++) {
              newAssignments.push({
                id: `${worker.id}-${stage}-${dayIndex}-${assignmentId++}`,
                workerId: worker.id,
                stage,
                date: formatDateToString(weekDays[dayIndex]),
                hours: 8,
              })
            }

            // Add half day if needed
            if (hasHalfDay && fullDays < weekDays.length) {
              newAssignments.push({
                id: `${worker.id}-${stage}-half-${assignmentId++}`,
                workerId: worker.id,
                stage,
                date: formatDateToString(weekDays[fullDays]),
                hours: 4,
              })
            }
          }
        })
      })

      updateAssignments(newAssignments)
    },
    [updateAssignments],
  )

  return {
    assignments: globalAssignments,
    workers: globalWorkers,
    updateAssignments,
    updateWorkers,
    moveAssignment,
    getAssignmentsForCell,
    generateAssignmentsFromWorkers,
  }
}
