export interface QCChecklistItem {
  id: string
  description: string
  checked: boolean
  critical: boolean
  category?: string
}

export interface QCChecklist {
  stage: string
  items: QCChecklistItem[]
  isPreWork: boolean
}

export interface QCApproval {
  status: "approved" | "approved-but-fixed" | "rework-required"
  issueDescription?: string
  timestamp: Date
  worker: string
}

export interface QCRecord {
  id: string
  batchId: string
  unitId: string
  stage: string
  worker: string
  checklist: QCChecklistItem[]
  approval: QCApproval
  workTime: number
}
