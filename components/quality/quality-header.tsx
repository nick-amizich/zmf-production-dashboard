'use client'

import { Badge } from '@/components/ui/badge'
import { ReportIssueModal } from './report-issue-modal'
import { AlertCircle } from 'lucide-react'
import { Database } from '@/types/database.types'

type Worker = Database['public']['Tables']['workers']['Row']

interface QualityHeaderProps {
  worker: Worker
  activeIssues: number
}

export function QualityHeader({ worker, activeIssues }: QualityHeaderProps) {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-theme-text-primary">Quality Control</h1>
          <p className="text-zinc-400 mt-1">
            Monitor quality checks and manage issues across production
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {activeIssues > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {activeIssues} Active Issues
            </Badge>
          )}
          
          <ReportIssueModal onSubmit={() => window.location.reload()} />
        </div>
      </div>
    </header>
  )
}