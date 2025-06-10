"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MetricsCard } from "./components/metrics-card"
import { WorkerStatusCard } from "./components/worker-status-card"
import { OrderCard } from "./components/order-card"
import { QualityChart } from "./components/quality-chart"
import { Headphones, AlertTriangle, CheckCircle, Users, Search, Filter, Plus, Settings } from "lucide-react"

// Sample data
const workers = [
  {
    id: "1",
    name: "Tony Martinez",
    currentTask: "Cup verification",
    stage: "Intake",
    status: "busy" as const,
    skills: ["Intake", "Sanding"],
    timeElapsed: "1h 23m",
  },
  {
    id: "2",
    name: "Jake Thompson",
    currentTask: "Surface preparation",
    stage: "Sanding",
    status: "busy" as const,
    skills: ["Sanding", "Assembly"],
    timeElapsed: "2h 15m",
  },
  {
    id: "3",
    name: "Kevin Chen",
    currentTask: "Stain application",
    stage: "Finishing",
    status: "busy" as const,
    skills: ["Finishing"],
    timeElapsed: "45m",
  },
  {
    id: "4",
    name: "Matt Wilson",
    currentTask: "Available",
    stage: "Acoustic QC",
    status: "available" as const,
    skills: ["QC", "Assembly"],
    timeElapsed: "0m",
  },
  {
    id: "5",
    name: "Laura Davis",
    currentTask: "Packaging prep",
    stage: "Shipping",
    status: "busy" as const,
    skills: ["Shipping", "QC"],
    timeElapsed: "30m",
  },
  {
    id: "6",
    name: "Sam Rodriguez",
    currentTask: "Break",
    stage: "Final Assembly",
    status: "break" as const,
    skills: ["Assembly", "Sanding"],
    timeElapsed: "15m",
  },
]

const orders = [
  {
    id: "1",
    orderNumber: "ZMF-2024-0156",
    customerName: "John Smith",
    model: "Verite Closed",
    woodType: "Sapele",
    currentStage: "Sanding",
    progress: 35,
    assignedWorker: "Jake Thompson",
    timeElapsed: "2h 15m",
    qualityStatus: "good" as const,
    dueDate: "2024-01-15",
  },
  {
    id: "2",
    orderNumber: "ZMF-2024-0157",
    customerName: "Sarah Johnson",
    model: "Caldera Closed",
    woodType: "Cocobolo",
    currentStage: "Finishing",
    progress: 60,
    assignedWorker: "Kevin Chen",
    timeElapsed: "45m",
    qualityStatus: "warning" as const,
    dueDate: "2024-01-18",
  },
  {
    id: "3",
    orderNumber: "ZMF-2024-0158",
    customerName: "Mike Chen",
    model: "Auteur",
    woodType: "Cherry",
    currentStage: "Sub-Assembly",
    progress: 75,
    assignedWorker: "Sam Rodriguez",
    timeElapsed: "3h 20m",
    qualityStatus: "good" as const,
    dueDate: "2024-01-12",
  },
  {
    id: "4",
    orderNumber: "ZMF-2024-0159",
    customerName: "Emily Davis",
    model: "Aeolus",
    woodType: "Ash",
    currentStage: "Intake",
    progress: 15,
    assignedWorker: "Tony Martinez",
    timeElapsed: "1h 23m",
    qualityStatus: "good" as const,
    dueDate: "2024-01-20",
  },
  {
    id: "5",
    orderNumber: "ZMF-2024-0160",
    customerName: "David Wilson",
    model: "Atticus",
    woodType: "Walnut",
    currentStage: "Final Assembly",
    progress: 85,
    assignedWorker: "Jake Thompson",
    timeElapsed: "4h 10m",
    qualityStatus: "critical" as const,
    dueDate: "2024-01-14",
  },
  {
    id: "6",
    orderNumber: "ZMF-2024-0161",
    customerName: "Lisa Anderson",
    model: "Eikon",
    woodType: "Maple",
    currentStage: "Acoustic QC",
    progress: 90,
    assignedWorker: "Matt Wilson",
    timeElapsed: "30m",
    qualityStatus: "good" as const,
    dueDate: "2024-01-16",
  },
]

export default function ProductionDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Add console log to verify component is rendering
  console.log("ProductionDashboard component rendering")

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.model.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white flex items-center justify-center">
        <div className="text-[#d4a574] text-xl">Loading Production Dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white">
      {/* Header */}
      <header className="border-b border-[#8B4513]/30 bg-[#1a0d08]/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Headphones className="h-8 w-8 text-[#d4a574]" />
            <div>
              <h1 className="text-2xl font-bold text-[#d4a574]">ZMF Production Control</h1>
              <p className="text-sm text-gray-400">Premium Headphone Manufacturing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Metrics Bar */}
      <div className="px-6 py-4 border-b border-[#8B4513]/30">
        <div className="grid grid-cols-4 gap-4">
          <MetricsCard
            title="Active Builds"
            value={12}
            subtitle="In production"
            icon={Headphones}
            trend="up"
            trendValue="+2 from yesterday"
          />
          <MetricsCard
            title="At-Risk Orders"
            value={3}
            subtitle="Behind schedule"
            icon={AlertTriangle}
            trend="down"
            trendValue="-1 from yesterday"
          />
          <MetricsCard
            title="Completed This Week"
            value={45}
            subtitle="Shipped orders"
            icon={CheckCircle}
            trend="up"
            trendValue="+12% vs last week"
          />
          <MetricsCard
            title="Staff Utilization"
            value="87%"
            subtitle="Average across all workers"
            icon={Users}
            trend="neutral"
            trendValue="Stable"
          />
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Sidebar - Workers */}
        <div className="w-80 border-r border-[#8B4513]/30 bg-[#1a0d08]/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#d4a574]">Worker Status</h2>
            <Badge variant="outline" className="border-[#8B4513] text-[#d4a574]">
              {workers.filter((w) => w.status === "available").length} Available
            </Badge>
          </div>
          <div className="space-y-3 overflow-y-auto">
            {workers.map((worker) => (
              <WorkerStatusCard key={worker.id} worker={worker} />
            ))}
          </div>
        </div>

        {/* Center - Order Queue */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#d4a574]">Production Queue</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[#1a0d08] border-[#8B4513]/30 text-white placeholder-gray-400"
                />
              </div>
              <Button variant="outline" size="sm" className="border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button size="sm" className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 overflow-y-auto">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        {/* Right Panel - Quality Metrics */}
        <div className="w-80 border-l border-[#8B4513]/30 bg-[#1a0d08]/30 p-4">
          <h2 className="text-lg font-semibold text-[#d4a574] mb-4">Quality Dashboard</h2>

          <div className="space-y-4">
            <QualityChart />

            <Card className="bg-[#1a0d08] border-[#8B4513]/30">
              <CardHeader>
                <CardTitle className="text-[#d4a574] text-sm">Recent Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  <span className="text-gray-300">Stain coverage uneven - ZMF-157</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-gray-300">Driver seating issue - ZMF-160</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-300">Wood grain matched - ZMF-159</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a0d08] border-[#8B4513]/30">
              <CardHeader>
                <CardTitle className="text-[#d4a574] text-sm">Stage Bottlenecks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Finishing</span>
                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                    2.3h avg
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Acoustic QC</span>
                  <Badge variant="outline" className="border-red-500 text-red-500">
                    3.1h avg
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
