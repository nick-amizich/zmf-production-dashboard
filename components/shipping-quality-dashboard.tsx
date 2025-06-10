"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Package, Clock, RefreshCcw, UserX } from "lucide-react"
import { useState } from "react"

interface ShippingQualityDashboardProps {
  onBack: () => void
}

const shippingData = {
  30: {
    built: 156,
    shipped: 142,
    avgWorkTime: 12.4,
    returnedToQC: 3.2,
    returnedByCustomer: 2.1,
  },
  60: {
    built: 298,
    shipped: 276,
    avgWorkTime: 11.8,
    returnedToQC: 3.5,
    returnedByCustomer: 2.3,
  },
  90: {
    built: 445,
    shipped: 418,
    avgWorkTime: 12.1,
    returnedToQC: 3.1,
    returnedByCustomer: 1.9,
  },
}

const modelQCReturnData = [
  {
    model: "Verite Closed",
    returnRate: 2.8,
    totalShipped: 45,
    returned: 2,
    reasons: ["Driver alignment", "Finish imperfection"],
    trend: "declining",
  },
  {
    model: "Verite Open",
    returnRate: 3.6,
    totalShipped: 36,
    returned: 2,
    reasons: ["Grill alignment", "Wood grain mismatch"],
    trend: "stable",
  },
  {
    model: "Caldera Closed",
    returnRate: 4.2,
    totalShipped: 32,
    returned: 2,
    reasons: ["Driver QC failure", "Finish inconsistency"],
    trend: "declining",
  },
  {
    model: "Caldera Open",
    returnRate: 3.1,
    totalShipped: 28,
    returned: 1,
    reasons: ["Acoustic performance"],
    trend: "improving",
  },
  {
    model: "Atticus",
    returnRate: 3.8,
    totalShipped: 24,
    returned: 1,
    reasons: ["Pad attachment issue"],
    trend: "stable",
  },
  {
    model: "Eikon",
    returnRate: 2.4,
    totalShipped: 21,
    returned: 1,
    reasons: ["Cable connection issue"],
    trend: "improving",
  },
]

export function ShippingQualityDashboard({ onBack }: ShippingQualityDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 60 | 90>(30)

  const currentData = shippingData[selectedPeriod]
  const shippingRate = ((currentData.shipped / currentData.built) * 100).toFixed(1)

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-400" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-400"
      case "declining":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white">
      {/* Header */}
      <header className="border-b border-[#8B4513]/30 bg-[#1a0d08]/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button onClick={onBack} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quality Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#d4a574]">Shipping Quality Dashboard</h1>
              <p className="text-sm text-gray-400">Production to shipping performance metrics</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Time Period Selector */}
        <div className="mb-6">
          <div className="flex gap-2">
            {[30, 60, 90].map((period) => (
              <Button
                key={period}
                onClick={() => setSelectedPeriod(period as 30 | 60 | 90)}
                variant={selectedPeriod === period ? "default" : "outline"}
                className={
                  selectedPeriod === period
                    ? "bg-[#8B4513] hover:bg-[#8B4513]/80 text-white"
                    : "border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20"
                }
              >
                {period} Days
              </Button>
            ))}
          </div>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          {/* Built vs Shipped */}
          <Card className="bg-[#1a0d08] border-[#8B4513]/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#d4a574] text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Production vs Shipping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Built</span>
                  <span className="text-white font-semibold">{currentData.built}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Shipped</span>
                  <span className="text-white font-semibold">{currentData.shipped}</span>
                </div>
                <div className="pt-2 border-t border-[#8B4513]/30">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Shipping Rate</span>
                    <span
                      className={`font-bold ${Number.parseFloat(shippingRate) >= 90 ? "text-green-400" : "text-amber-400"}`}
                    >
                      {shippingRate}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Time per Shipped Unit */}
          <Card className="bg-[#1a0d08] border-[#8B4513]/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#d4a574] text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Work Time Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{currentData.avgWorkTime}h</div>
                  <div className="text-sm text-gray-400">per shipped unit</div>
                </div>
                <div className="pt-2 border-t border-[#8B4513]/30">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Target</span>
                    <span className="text-gray-300">≤ 12.0h</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-400 text-sm">Status</span>
                    <Badge
                      variant={currentData.avgWorkTime <= 12.0 ? "default" : "destructive"}
                      className={
                        currentData.avgWorkTime <= 12.0
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }
                    >
                      {currentData.avgWorkTime <= 12.0 ? "On Target" : "Over Target"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Returned to QC Rate */}
          <Card className="bg-[#1a0d08] border-[#8B4513]/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#d4a574] text-lg flex items-center gap-2">
                <RefreshCcw className="h-5 w-5" />
                Returned to QC
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{currentData.returnedToQC}%</div>
                  <div className="text-sm text-gray-400">of shipped units</div>
                </div>
                <div className="pt-2 border-t border-[#8B4513]/30">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Target</span>
                    <span className="text-gray-300">≤ 3.0%</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-400 text-sm">Status</span>
                    <Badge
                      variant={currentData.returnedToQC <= 3.0 ? "default" : "destructive"}
                      className={
                        currentData.returnedToQC <= 3.0
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-amber-600 hover:bg-amber-700"
                      }
                    >
                      {currentData.returnedToQC <= 3.0 ? "Good" : "Needs Attention"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Returned by Customer Rate */}
          <Card className="bg-[#1a0d08] border-[#8B4513]/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#d4a574] text-lg flex items-center gap-2">
                <UserX className="h-5 w-5" />
                Returned by Customer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{currentData.returnedByCustomer}%</div>
                  <div className="text-sm text-gray-400">of shipped units</div>
                </div>
                <div className="pt-2 border-t border-[#8B4513]/30">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Target</span>
                    <span className="text-gray-300">≤ 2.0%</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-400 text-sm">Status</span>
                    <Badge
                      variant={currentData.returnedByCustomer <= 2.0 ? "default" : "destructive"}
                      className={
                        currentData.returnedByCustomer <= 2.0
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-amber-600 hover:bg-amber-700"
                      }
                    >
                      {currentData.returnedByCustomer <= 2.0 ? "Good" : "Needs Attention"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Shipping Quality */}
          <Card className="bg-[#1a0d08] border-[#8B4513]/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#d4a574] text-lg">Overall Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">97.9%</div>
                  <div className="text-sm text-gray-400">shipping success rate</div>
                </div>
                <div className="pt-2 border-t border-[#8B4513]/30">
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm">+0.3% this period</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Return to QC Rate by Model */}
        <Card className="bg-[#1a0d08] border-[#8B4513]/30">
          <CardHeader>
            <CardTitle className="text-[#d4a574]">Returned to QC by Model</CardTitle>
            <p className="text-sm text-gray-400">Detailed breakdown of internal QC returns by headphone model</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {modelQCReturnData.map((model) => (
                <div
                  key={model.model}
                  className="p-4 rounded-lg bg-[#0a0a0a]/50 border border-[#8B4513]/20 hover:border-[#8B4513]/40 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-white">{model.model}</h3>
                      <p className="text-sm text-gray-400">{model.totalShipped} shipped</p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${model.returnRate <= 3.0 ? "text-green-400" : "text-amber-400"}`}
                      >
                        {model.returnRate}%
                      </div>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(model.trend)}
                        <span className={`text-xs ${getTrendColor(model.trend)}`}>{model.trend}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Returned to QC</span>
                      <span className="text-white">{model.returned} units</span>
                    </div>

                    {model.reasons.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">QC issues:</p>
                        <div className="flex flex-wrap gap-1">
                          {model.reasons.map((reason, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-[#8B4513]/30 text-gray-300">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
