'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts'

interface WorkerPerformanceChartProps {
  workers: any[]
}

const STAGE_COLORS = {
  'Intake': '#8b5cf6',
  'Sanding': '#ec4899',
  'Finishing': '#f59e0b',
  'Sub-Assembly': '#10b981',
  'Final Assembly': '#3b82f6',
  'Acoustic QC': '#6366f1',
  'Shipping': '#84cc16'
}

export function WorkerPerformanceChart({ workers }: WorkerPerformanceChartProps) {
  // Mock data for stage distribution
  const stageData = [
    { stage: 'Intake', workers: 2 },
    { stage: 'Sanding', workers: 3 },
    { stage: 'Finishing', workers: 2 },
    { stage: 'Sub-Assembly', workers: 4 },
    { stage: 'Final Assembly', workers: 3 },
    { stage: 'Acoustic QC', workers: 2 },
    { stage: 'Shipping', workers: 1 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workers by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="stage" 
                stroke="#888" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="workers" name="Workers">
                {stageData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STAGE_COLORS[entry.stage as keyof typeof STAGE_COLORS] || '#666'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}