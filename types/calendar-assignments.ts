export interface Worker {
  id: string
  name: string
  photo: string
  primarySkill: string
  skillLevel: 1 | 2 | 3
  weeklyCapacity: number
  scheduledHours: number
  available: boolean
  stageAssignments: {
    [stage: string]: number
  }
}

export interface CalendarAssignment {
  id: string
  workerId: string
  stage: string
  date: string
  hours: number
  batchId?: string
}

export const PRODUCTION_STAGES = [
  "Intake",
  "Sanding",
  "Finishing",
  "Sub-Assembly",
  "Final Assembly",
  "Acoustic QC",
  "Shipping",
]

export const STAGE_COLORS = {
  Intake: "bg-blue-600",
  Sanding: "bg-yellow-600",
  Finishing: "bg-purple-600",
  "Sub-Assembly": "bg-green-600",
  "Final Assembly": "bg-orange-600",
  "Acoustic QC": "bg-red-600",
  Shipping: "bg-gray-600",
}
