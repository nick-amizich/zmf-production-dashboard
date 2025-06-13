"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"

interface IssueData {
  stage: string
  count: number
  critical: number
  major: number
  minor: number
  color: string
}

const issuesByStageData: IssueData[] = [
  {
    stage: "Intake",
    count: 3,
    critical: 0,
    major: 1,
    minor: 2,
    color: "#3b82f6",
  },
  {
    stage: "Sanding",
    count: 6,
    critical: 0,
    major: 2,
    minor: 4,
    color: "#f59e0b",
  },
  {
    stage: "Finishing",
    count: 12,
    critical: 2,
    major: 5,
    minor: 5,
    color: "#8b5cf6",
  },
  {
    stage: "Sub-Assembly",
    count: 4,
    critical: 1,
    major: 2,
    minor: 1,
    color: "#06b6d4",
  },
  {
    stage: "Final Assembly",
    count: 8,
    critical: 3,
    major: 3,
    minor: 2,
    color: "#f97316",
  },
  {
    stage: "Acoustic QC",
    count: 9,
    critical: 2,
    major: 4,
    minor: 3,
    color: "#ec4899",
  },
  {
    stage: "Shipping",
    count: 1,
    critical: 0,
    major: 0,
    minor: 1,
    color: "#10b981",
  },
]

interface IssuesByStageChartProps {
  onStageClick: (stage: string) => void
}

export function IssuesByStageChart({ onStageClick }: IssuesByStageChartProps) {
  return (
    <Card className="bg-theme-bg-secondary border-theme-border-primary">
      <CardHeader>
        <CardTitle className="text-theme-text-secondary">Issues by Production Stage</CardTitle>
        <p className="text-sm text-theme-text-tertiary">Click on any stage to view detailed issue breakdown</p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Total Issues",
              color: "#d4a574",
            },
            critical: {
              label: "Critical",
              color: "#ef4444",
            },
            major: {
              label: "Major",
              color: "#f59e0b",
            },
            minor: {
              label: "Minor",
              color: "#3b82f6",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={issuesByStageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                dataKey="stage"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#d4a574", fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#d4a574", fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="#d4a574"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(data) => onStageClick(data.stage)}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="mt-4 grid grid-cols-7 gap-2">
          {issuesByStageData.map((stage) => (
            <Button
              key={stage.stage}
              variant="ghost"
              size="sm"
              onClick={() => onStageClick(stage.stage)}
              className="text-theme-text-secondary hover:text-theme-text-secondary/80 hover:bg-theme-brand-secondary/20 flex flex-col items-center p-2 h-auto"
            >
              <div className="text-xs font-medium">{stage.stage}</div>
              <div className="text-xs text-theme-text-tertiary">{stage.count} issues</div>
              <div className="flex gap-1 mt-1">
                {stage.critical > 0 && (
                  <div className="w-2 h-2 bg-theme-status-error rounded-full" title={`${stage.critical} critical`} />
                )}
                {stage.major > 0 && (
                  <div className="w-2 h-2 bg-theme-status-warning rounded-full" title={`${stage.major} major`} />
                )}
                {stage.minor > 0 && <div className="w-2 h-2 bg-theme-status-info rounded-full" title={`${stage.minor} minor`} />}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
