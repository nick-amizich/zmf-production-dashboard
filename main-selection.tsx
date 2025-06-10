"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Headphones, Users, Monitor, Clock } from "lucide-react"

interface MainSelectionProps {
  onWorkerInterface: () => void
  onProductionManagement: () => void
}

export default function MainSelection({ onWorkerInterface, onProductionManagement }: MainSelectionProps) {
  const currentTime = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white">
      {/* Header */}
      <header className="text-center py-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#8B4513] to-[#d4a574] rounded-xl flex items-center justify-center">
            <Headphones className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-[#d4a574]">ZMF PRODUCTION</h1>
            <p className="text-xl text-gray-300">Premium Headphone Manufacturing</p>
          </div>
        </div>

        <div className="text-gray-400 text-lg mb-2">{currentTime}</div>
        <div className="flex items-center justify-center gap-2 text-[#d4a574] text-xl">
          <Clock className="h-5 w-5" />
          <span>Active Production: 12 orders</span>
        </div>
      </header>

      {/* Main Selection */}
      <main className="container mx-auto px-6 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Worker Interface */}
          <Card className="bg-[#1a0d08] border-[#8B4513]/30 hover:border-[#d4a574]/50 transition-all duration-300 group cursor-pointer">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-12 w-12 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-[#d4a574] mb-4">WORKER INTERFACE</h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Mobile-optimized interface for shop floor workers. Large touch targets, quality checklists, and timer
                tracking.
              </p>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#d4a574] rounded-full" />
                  <span className="text-gray-300">Stage-specific quality checklists</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#d4a574] rounded-full" />
                  <span className="text-gray-300">Photo documentation capture</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#d4a574] rounded-full" />
                  <span className="text-gray-300">Timer and productivity tracking</span>
                </div>
              </div>

              <Button
                onClick={onWorkerInterface}
                className="w-full h-16 bg-green-600 hover:bg-green-700 text-white text-xl font-semibold group-hover:bg-teal-600 transition-all duration-300"
              >
                START WORKING
              </Button>
            </CardContent>
          </Card>

          {/* Production Management */}
          <Card className="bg-[#1a0d08] border-[#8B4513]/30 hover:border-[#d4a574]/50 transition-all duration-300 group cursor-pointer">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-[#8B4513] to-[#d4a574] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Monitor className="h-12 w-12 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-[#d4a574] mb-4">PRODUCTION MANAGEMENT</h2>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                Complete production oversight with order management, batch control, and quality monitoring.
              </p>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#d4a574] rounded-full" />
                  <span className="text-gray-300">Order creation and tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#d4a574] rounded-full" />
                  <span className="text-gray-300">Batch management and workflow</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#d4a574] rounded-full" />
                  <span className="text-gray-300">Quality metrics and analytics</span>
                </div>
              </div>

              <Button
                onClick={onProductionManagement}
                className="w-full h-16 bg-[#8B4513] hover:bg-[#8B4513]/80 text-white text-xl font-semibold group-hover:bg-[#d4a574] group-hover:text-[#1a0d08] transition-all duration-300"
              >
                MANAGE PRODUCTION
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="mt-16 text-center">
          <div className="bg-[#1a0d08]/50 rounded-lg p-6 border border-[#8B4513]/30">
            <div className="grid grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white">6</div>
                <div className="text-sm text-gray-400">Workers Online</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">94%</div>
                <div className="text-sm text-gray-400">Quality Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#d4a574]">8</div>
                <div className="text-sm text-gray-400">Completed Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">2</div>
                <div className="text-sm text-gray-400">Quality Issues</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
