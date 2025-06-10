"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts"

const qualityTrendData = [
  {
    date: "Jan 1",
    overall: 92.1,
    intake: 97,
    sanding: 94,
    finishing: 91,
    subAssembly: 95,
    finalAssembly: 90,
    acousticQC: 88,
    shipping: 98,
  },
  {
    date: "Jan 8",
    overall: 93.2,
    intake: 98,
    sanding: 95,
    finishing: 92,
    subAssembly: 96,
    finalAssembly: 91,
    acousticQC: 89,
    shipping: 99,
  },
  {
    date: "Jan 15",
    overall: 93.8,
    intake: 98,
    sanding: 96,
    finishing: 93,
    subAssembly: 97,
    finalAssembly: 92,
    acousticQC: 90,
    shipping: 99,
  },
  {
    date: "Jan 22",
    overall: 94.1,
    intake: 98,
    sanding: 96,
    finishing: 94,
    subAssembly: 97,
    finalAssembly: 93,
    acousticQC: 91,
    shipping: 99,
  },
  {
    date: "Jan 29",
    overall: 94.2,
    intake: 98,
    sanding: 96,
    finishing: 94,
    subAssembly: 97,
    finalAssembly: 93,
    acousticQC: 91,
    shipping: 99,
  },
]

export function QualityTrendChart() {
  return (
    <Card className="bg-[#1a0d08] border-[#8B4513]/30">
      <CardHeader>
        <CardTitle className="text-[#d4a574]">Quality Trends - Last 30 Days</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            overall: {
              label: "Overall Quality",
              color: "#d4a574",
            },
            intake: {
              label: "Intake",
              color: "#3b82f6",
            },
            sanding: {
              label: "Sanding",
              color: "#f59e0b",
            },
            finishing: {
              label: "Finishing",
              color: "#8b5cf6",
            },
            subAssembly: {
              label: "Sub-Assembly",
              color: "#06b6d4",
            },
            finalAssembly: {
              label: "Final Assembly",
              color: "#6366f1",
            },
            acousticQC: {
              label: "Acoustic QC",
              color: "#ec4899",
            },
            shipping: {
              label: "Shipping",
              color: "#10b981",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={qualityTrendData}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#d4a574", fontSize: 12 }} />
              <YAxis domain={[85, 100]} axisLine={false} tickLine={false} tick={{ fill: "#d4a574", fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="overall"
                stroke="#d4a574"
                fill="#d4a574"
                fillOpacity={0.2}
                strokeWidth={3}
              />
              <Line type="monotone" dataKey="intake" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="sanding" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="finishing" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="subAssembly" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="finalAssembly" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="acousticQC" stroke="#ec4899" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="shipping" stroke="#10b981" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
