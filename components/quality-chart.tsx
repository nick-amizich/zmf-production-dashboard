"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer } from "recharts"

const qualityData = [
  { stage: "Intake", rate: 98 },
  { stage: "Sanding", rate: 96 },
  { stage: "Finishing", rate: 94 },
  { stage: "Sub-Asm", rate: 97 },
  { stage: "Final", rate: 93 },
  { stage: "QC", rate: 91 },
  { stage: "Ship", rate: 99 },
]

export function QualityChart() {
  return (
    <Card className="bg-theme-bg-secondary border-theme-border-primary">
      <CardHeader>
        <CardTitle className="text-theme-text-secondary">Quality Pass Rates</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            rate: {
              label: "Pass Rate %",
              color: "#d4a574",
            },
          }}
          className="h-[200px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={qualityData}>
              <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: "#d4a574", fontSize: 12 }} />
              <YAxis domain={[85, 100]} axisLine={false} tickLine={false} tick={{ fill: "#d4a574", fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#d4a574"
                strokeWidth={2}
                dot={{ fill: "#d4a574", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
