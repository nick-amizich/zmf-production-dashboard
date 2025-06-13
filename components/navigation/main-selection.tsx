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
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary">
      {/* Header */}
      <header className="text-center py-12">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-theme-brand-secondary to-theme-brand-primary rounded-xl flex items-center justify-center">
            <Headphones className="h-10 w-10 text-theme-text-primary" />
          </div>
          <div>
            <h1 className="text-5xl font-bold text-theme-text-secondary">ZMF PRODUCTION</h1>
            <p className="text-xl text-theme-text-tertiary">Premium Headphone Manufacturing</p>
          </div>
        </div>

        <div className="text-theme-text-tertiary text-lg mb-2">{currentTime}</div>
        <div className="flex items-center justify-center gap-2 text-theme-text-secondary text-xl">
          <Clock className="h-5 w-5" />
          <span>Active Production: 12 orders</span>
        </div>
      </header>

      {/* Main Selection */}
      <main className="container mx-auto px-6 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Worker Interface */}
          <Card className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all duration-300 group cursor-pointer">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-theme-status-success to-teal-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-12 w-12 text-theme-text-primary" />
              </div>

              <h2 className="text-3xl font-bold text-theme-text-secondary mb-4">WORKER INTERFACE</h2>
              <p className="text-theme-text-tertiary text-lg mb-8 leading-relaxed">
                Mobile-optimized interface for shop floor workers. Large touch targets, quality checklists, and timer
                tracking.
              </p>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-theme-brand-primary rounded-full" />
                  <span className="text-theme-text-tertiary">Stage-specific quality checklists</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-theme-brand-primary rounded-full" />
                  <span className="text-theme-text-tertiary">Photo documentation capture</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-theme-brand-primary rounded-full" />
                  <span className="text-theme-text-tertiary">Timer and productivity tracking</span>
                </div>
              </div>

              <Button
                onClick={onWorkerInterface}
                className="w-full h-16 bg-theme-status-success hover:bg-green-700 text-theme-text-primary text-xl font-semibold group-hover:bg-teal-600 transition-all duration-300"
              >
                START WORKING
              </Button>
            </CardContent>
          </Card>

          {/* Production Management */}
          <Card className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all duration-300 group cursor-pointer">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-theme-brand-secondary to-theme-brand-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Monitor className="h-12 w-12 text-theme-text-primary" />
              </div>

              <h2 className="text-3xl font-bold text-theme-text-secondary mb-4">PRODUCTION MANAGEMENT</h2>
              <p className="text-theme-text-tertiary text-lg mb-8 leading-relaxed">
                Complete production oversight with order management, batch control, and quality monitoring.
              </p>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-theme-brand-primary rounded-full" />
                  <span className="text-theme-text-tertiary">Order creation and tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-theme-brand-primary rounded-full" />
                  <span className="text-theme-text-tertiary">Batch management and workflow</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-theme-brand-primary rounded-full" />
                  <span className="text-theme-text-tertiary">Quality metrics and analytics</span>
                </div>
              </div>

              <Button
                onClick={onProductionManagement}
                className="w-full h-16 bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary text-xl font-semibold group-hover:bg-theme-brand-primary group-hover:text-theme-bg-secondary transition-all duration-300"
              >
                MANAGE PRODUCTION
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="mt-16 text-center">
          <div className="bg-theme-bg-secondary/50 rounded-lg p-6 border border-theme-border-primary">
            <div className="grid grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-theme-text-primary">6</div>
                <div className="text-sm text-theme-text-tertiary">Workers Online</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-theme-status-success">94%</div>
                <div className="text-sm text-theme-text-tertiary">Quality Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-theme-text-secondary">8</div>
                <div className="text-sm text-theme-text-tertiary">Completed Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-theme-status-info">2</div>
                <div className="text-sm text-theme-text-tertiary">Quality Issues</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
