import { 
  CalendarBatch,
  CalendarWorker,
  CalendarAssignment
} from '@/lib/services/production-calendar-service'

export class ProductionCalendarAPI {
  static async getCalendarData(startDate: Date, endDate: Date) {
    const params = new URLSearchParams({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    })
    
    const response = await fetch(`/api/production/calendar?${params}`)
    if (!response.ok) throw new Error('Failed to fetch calendar data')
    
    return response.json() as Promise<{
      batches: CalendarBatch[]
      workers: CalendarWorker[]
      assignments: CalendarAssignment[]
    }>
  }

  static async createAssignment(data: {
    workerId: string
    batchId: string
    date: string
    stage: string
    hours: number
  }) {
    const response = await fetch('/api/production/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    
    if (!response.ok) throw new Error('Failed to create assignment')
    return response.json()
  }

  static async updateAssignment(
    assignmentId: string,
    updates: {
      workerId?: string
      date?: string
      hours?: number
    }
  ) {
    const response = await fetch(`/api/production/calendar/${assignmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    
    if (!response.ok) throw new Error('Failed to update assignment')
    return response.json()
  }

  static async deleteAssignment(assignmentId: string) {
    const response = await fetch(`/api/production/calendar/${assignmentId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) throw new Error('Failed to delete assignment')
    return response.json()
  }
}