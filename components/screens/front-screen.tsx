"use client"

import { useState, Suspense } from "react"
import dynamic from "next/dynamic"
import { RoleSelectionCard } from "@/components/role-selection-card"
import { SystemStatus } from "@/components/system-status"
import { Settings, Monitor, Smartphone, Headphones, ArrowRight, BarChart3, Plus, Calendar, Package } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DebugNavigation } from "@/components/debug-navigation"

// Dynamic imports to prevent client-reference-manifest issues
const ProductionManagerDashboard = dynamic(() => import("@/components/production/production-manager-dashboard"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
})

const MobileWorkerInterface = dynamic(() => import("@/components/worker/mobile-worker-interface"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
})

const BatchManagement = dynamic(() => import("@/components/production/batch-management"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
})

const QualityControlDashboard = dynamic(() => import("@/components/quality/quality-control-dashboard"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
})

const BatchOrderCreator = dynamic(() => import("@/components/batch-order-creator"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
})

const ProductionCalendar = dynamic(() => import("@/components/production/production-calendar"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
})

const OrderManagement = dynamic(() => import("@/components/orders/order-management"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
})

const SimplifiedWorkerInterface = dynamic(() => import("@/components/worker/simplified-worker-interface"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
})

type ViewMode =
  | "front"
  | "production-management-menu"
  | "production-dashboard"
  | "batch-management"
  | "worker-interface"
  | "quality-dashboard"
  | "order-creator"
  | "production-calendar"
  | "order-management"
  | "simplified-worker-interface"

export default function FrontScreen() {
  const [currentView, setCurrentView] = useState<ViewMode>("front")

  const handleProductionManagementMenu = () => {
    setCurrentView("production-management-menu")
  }

  const handleProductionDashboard = () => {
    setCurrentView("production-dashboard")
  }

  const handleBatchManagement = () => {
    setCurrentView("batch-management")
  }

  const handleWorkerInterface = () => {
    setCurrentView("simplified-worker-interface")
  }

  const handleQualityDashboard = () => {
    setCurrentView("quality-dashboard")
  }

  const handleBackToFront = () => {
    setCurrentView("front")
  }

  const handleBackToProductionMenu = () => {
    setCurrentView("production-management-menu")
  }

  const handleOrderCreator = () => {
    setCurrentView("order-creator")
  }

  const handleProductionCalendar = () => {
    setCurrentView("production-calendar")
  }

  const handleOrderManagement = () => {
    setCurrentView("order-management")
  }

  // Render different views based on current selection
  if (currentView === "production-dashboard") {
    return (
      <div className="relative">
        <div className="fixed top-4 left-4 z-50 flex gap-2">
          <Button onClick={handleBackToProductionMenu} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
            ← Back to Production Menu
          </Button>
          <Button
            onClick={handleBackToFront}
            variant="outline"
            className="border-theme-border-active text-theme-brand-secondary hover:bg-theme-brand-secondary/10"
          >
            Home
          </Button>
        </div>
        <ProductionManagerDashboard />
      </div>
    )
  }

  if (currentView === "batch-management") {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50 flex gap-2">
          <Button onClick={handleBackToProductionMenu} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
            ← Back to Production Menu
          </Button>
          <Button
            onClick={handleBackToFront}
            variant="outline"
            className="border-theme-border-active text-theme-brand-secondary hover:bg-theme-brand-secondary/10"
          >
            Home
          </Button>
        </div>
        <BatchManagement onBack={handleBackToProductionMenu} />
      </div>
    )
  }

  if (currentView === "worker-interface") {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <Button onClick={handleBackToFront} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
            ← Back to Home
          </Button>
        </div>
        <MobileWorkerInterface />
      </div>
    )
  }

  if (currentView === "quality-dashboard") {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50 flex gap-2">
          <Button onClick={handleBackToProductionMenu} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
            ← Back to Production Menu
          </Button>
          <Button
            onClick={handleBackToFront}
            variant="outline"
            className="border-theme-border-active text-theme-brand-secondary hover:bg-theme-brand-secondary/10"
          >
            Home
          </Button>
        </div>
        <QualityControlDashboard onBack={handleBackToProductionMenu} />
      </div>
    )
  }

  if (currentView === "order-creator") {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50 flex gap-2">
          <Button onClick={handleBackToProductionMenu} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
            ← Back to Production Menu
          </Button>
          <Button
            onClick={handleBackToFront}
            variant="outline"
            className="border-theme-border-active text-theme-brand-secondary hover:bg-theme-brand-secondary/10"
          >
            Home
          </Button>
        </div>
        <BatchOrderCreator onBack={handleBackToProductionMenu} />
      </div>
    )
  }

  if (currentView === "production-calendar") {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50 flex gap-2">
          <Button onClick={handleBackToProductionMenu} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
            ← Back to Production Menu
          </Button>
          <Button
            onClick={handleBackToFront}
            variant="outline"
            className="border-theme-border-active text-theme-brand-secondary hover:bg-theme-brand-secondary/10"
          >
            Home
          </Button>
        </div>
        <ProductionCalendar onBack={handleBackToProductionMenu} />
      </div>
    )
  }

  if (currentView === "order-management") {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50 flex gap-2">
          <Button onClick={handleBackToProductionMenu} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
            ← Back to Production Menu
          </Button>
          <Button
            onClick={handleBackToFront}
            variant="outline"
            className="border-theme-border-active text-theme-brand-secondary hover:bg-theme-brand-secondary/10"
          >
            Home
          </Button>
        </div>
        <OrderManagement onBack={handleBackToProductionMenu} />
      </div>
    )
  }

  if (currentView === "simplified-worker-interface") {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <Button onClick={handleBackToFront} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
            ← Back to Home
          </Button>
        </div>
        <SimplifiedWorkerInterface onBack={handleBackToFront} />
      </div>
    )
  }

  // Production Management Menu
  if (currentView === "production-management-menu") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary">
        {/* Header */}
        <header className="border-b border-theme-border-primary bg-theme-bg-secondary/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button onClick={handleBackToFront} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
                  ← Back to Home
                </Button>
                <div className="w-16 h-16 bg-gradient-to-br from-theme-brand-secondary to-theme-brand-primary rounded-lg flex items-center justify-center">
                  <Monitor className="h-8 w-8 text-theme-text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-theme-text-secondary">Production Management</h1>
                  <p className="text-theme-text-tertiary text-lg">Choose your management interface</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-theme-text-primary mb-4">Management Interfaces</h2>
            <p className="text-xl text-theme-text-tertiary max-w-2xl mx-auto">
              Select the specific management tool you need. Each interface provides specialized functionality for
              different aspects of production oversight.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Production Dashboard & Orders (Consolidated) */}
            <RoleSelectionCard
              title="Production Dashboard"
              description="Real-time oversight with intervention capabilities"
              icon={Monitor}
              features={[
                "Live production metrics",
                "Emergency stop controls",
                "Worker communication tools",
                "Alert management system",
              ]}
              buttonText="Open Dashboard"
              onClick={handleProductionDashboard}
              gradient="bg-gradient-to-br from-theme-brand-secondary to-theme-brand-primary"
            />

            {/* Production Calendar */}
            <RoleSelectionCard
              title="Production Calendar"
              description="Two-week scheduling and worker assignment"
              icon={Calendar}
              features={[
                "Visual 2-week calendar grid",
                "Drag-and-drop batch assignment",
                "Worker capacity management",
                "Real-time workload balancing",
              ]}
              buttonText="Open Calendar"
              onClick={handleProductionCalendar}
              gradient="bg-gradient-to-br from-indigo-600 to-theme-status-info"
            />

            {/* Batch Management */}
            <RoleSelectionCard
              title="Batch Management"
              description="Visual workflow control and batch coordination"
              icon={ArrowRight}
              features={[
                "Drag-and-drop batch workflow",
                "7-stage production pipeline",
                "Subassembly management",
                "Efficiency recommendations",
              ]}
              buttonText="Manage Batches"
              onClick={handleBatchManagement}
              gradient="bg-gradient-to-br from-theme-status-info to-purple-600"
            />

            {/* Quality Dashboard */}
            <RoleSelectionCard
              title="Quality Control"
              description="Comprehensive quality analytics and monitoring"
              icon={BarChart3}
              features={[
                "Stage-by-stage quality metrics",
                "Issue tracking and resolution",
                "Worker performance analytics",
                "Quality trend analysis",
              ]}
              buttonText="View Quality Dashboard"
              onClick={handleQualityDashboard}
              gradient="bg-gradient-to-br from-theme-status-warning to-theme-status-error"
            />

            {/* Order Creator */}
            <RoleSelectionCard
              title="Order Creator"
              description="Create new orders and batch configurations"
              icon={Plus}
              features={[
                "Manual order entry system",
                "Batch configuration builder",
                "Shopify integration sync",
                "Technician notes and images",
              ]}
              buttonText="Create Orders"
              onClick={handleOrderCreator}
              gradient="bg-gradient-to-br from-purple-600 to-purple-700"
            />

            {/* Order Management */}
            <RoleSelectionCard
              title="Order Management"
              description="Track and manage customer orders"
              icon={Package}
              features={[
                "Order status tracking",
                "Customer information",
                "Priority management",
                "Order history and details",
              ]}
              buttonText="Manage Orders"
              onClick={handleOrderManagement}
              gradient="bg-gradient-to-br from-theme-status-success to-teal-600"
            />
          </div>

          {/* Quick Access Panel */}
          <div className="mt-16 max-w-5xl mx-auto">
            <Card className="bg-theme-bg-secondary/50 border-theme-border-primary">
              <CardHeader>
                <CardTitle className="text-theme-text-secondary text-center">Quick Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <Button
                    onClick={handleProductionDashboard}
                    variant="outline"
                    className="border-theme-border-primary text-theme-text-secondary hover:bg-theme-brand-secondary/20 h-auto py-4 flex flex-col gap-2"
                  >
                    <Monitor className="h-6 w-6" />
                    <span className="text-sm">Dashboard</span>
                  </Button>
                  <Button
                    onClick={handleProductionCalendar}
                    variant="outline"
                    className="border-theme-status-info/50 text-theme-status-info hover:bg-theme-status-info/20 h-auto py-4 flex flex-col gap-2"
                  >
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Calendar</span>
                  </Button>
                  <Button
                    onClick={handleBatchManagement}
                    variant="outline"
                    className="border-theme-status-info/50 text-theme-status-info hover:bg-theme-status-info/20 h-auto py-4 flex flex-col gap-2"
                  >
                    <ArrowRight className="h-6 w-6" />
                    <span className="text-sm">Batches</span>
                  </Button>
                  <Button
                    onClick={handleQualityDashboard}
                    variant="outline"
                    className="border-theme-status-warning/50 text-theme-status-warning hover:bg-theme-status-warning/20 h-auto py-4 flex flex-col gap-2"
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">Quality</span>
                  </Button>
                  <Button
                    onClick={handleOrderCreator}
                    variant="outline"
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 h-auto py-4 flex flex-col gap-2"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">Create</span>
                  </Button>
                  <Button
                    onClick={handleOrderManagement}
                    variant="outline"
                    className="border-theme-status-success/50 text-theme-status-success hover:bg-theme-status-success/20 h-auto py-4 flex flex-col gap-2"
                  >
                    <Package className="h-6 w-6" />
                    <span className="text-sm">Orders</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Debug Navigation */}
        <DebugNavigation currentView={currentView} onViewChange={setCurrentView} />
      </div>
    )
  }

  // Front screen view - Main landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary">
      {/* Header */}
      <header className="border-b border-theme-border-primary bg-theme-bg-secondary/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-theme-brand-secondary to-theme-brand-primary rounded-lg flex items-center justify-center">
                <Headphones className="h-8 w-8 text-theme-text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-theme-text-secondary">ZMF Production System</h1>
                <p className="text-theme-text-tertiary text-lg">Premium Headphone Manufacturing Control</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <Button variant="outline" className="border-theme-border-primary text-theme-text-secondary hover:bg-theme-brand-secondary/20">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-theme-text-primary mb-4">Choose Your Role</h2>
          <p className="text-xl text-theme-text-tertiary max-w-2xl mx-auto">
            Select your primary role in the ZMF production process. Each interface is optimized for specific
            responsibilities and workflows.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Production Management - Main Category */}
          <div className="space-y-6">
            <RoleSelectionCard
              title="Production Management"
              description="Comprehensive management tools and oversight"
              icon={Monitor}
              features={[
                "Real-time production dashboard",
                "Calendar scheduling system",
                "Batch workflow management",
                "Quality control analytics",
              ]}
              buttonText="Enter Management Suite"
              onClick={handleProductionManagementMenu}
              gradient="bg-gradient-to-br from-theme-brand-secondary to-theme-brand-primary"
            />

            {/* Sub-options preview */}
            <Card className="bg-theme-bg-secondary/30 border-theme-border-secondary">
              <CardContent className="p-4">
                <h4 className="text-theme-text-secondary font-semibold mb-3 text-sm uppercase tracking-wide">
                  Management Tools Include:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-theme-text-tertiary">
                    <Monitor className="h-3 w-3 text-theme-brand-secondary" />
                    <span>Production Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-theme-text-tertiary">
                    <Calendar className="h-3 w-3 text-theme-status-info" />
                    <span>Production Calendar</span>
                  </div>
                  <div className="flex items-center gap-2 text-theme-text-tertiary">
                    <ArrowRight className="h-3 w-3 text-theme-status-info" />
                    <span>Batch Management</span>
                  </div>
                  <div className="flex items-center gap-2 text-theme-text-tertiary">
                    <BarChart3 className="h-3 w-3 text-theme-status-warning" />
                    <span>Quality Control</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Worker Interface - Main Category */}
          <div className="space-y-6">
            <RoleSelectionCard
              title="Worker Interface"
              description="Mobile-optimized interface for shop floor workers"
              icon={Smartphone}
              features={[
                "Large touch targets for gloved hands",
                "Stage-specific quality checklists",
                "Photo documentation capture",
                "Timer and productivity tracking",
              ]}
              buttonText="Start Working"
              onClick={handleWorkerInterface}
              gradient="bg-gradient-to-br from-theme-status-success to-teal-600"
            />

            {/* Worker features preview */}
            <Card className="bg-theme-bg-secondary/30 border-theme-status-success/20">
              <CardContent className="p-4">
                <h4 className="text-theme-status-success font-semibold mb-3 text-sm uppercase tracking-wide">Optimized For:</h4>
                <div className="space-y-2 text-sm text-theme-text-tertiary">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-theme-status-success rounded-full"></div>
                    <span>Workshop environment with gloves</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-theme-status-success rounded-full"></div>
                    <span>Variable lighting conditions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-theme-status-success rounded-full"></div>
                    <span>Offline capability for connectivity issues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-theme-status-success rounded-full"></div>
                    <span>7-stage production workflow</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-16 max-w-md mx-auto">
          <SystemStatus />
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="bg-theme-bg-secondary/50 rounded-lg p-6 max-w-4xl mx-auto border border-theme-border-primary">
            <h3 className="text-xl font-semibold text-theme-text-secondary mb-3">About ZMF Production System</h3>
            <p className="text-theme-text-tertiary leading-relaxed">
              This quality-first production management system manages the complete workflow from raw materials to
              shipping across 7 production stages. Built specifically for ZMF's premium wooden headphone manufacturing
              process with comprehensive quality control at each stage.
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-theme-text-tertiary">
              <span>7 Production Stages</span>
              <span>•</span>
              <span>15 Skilled Craftspeople</span>
              <span>•</span>
              <span>Premium Quality Focus</span>
            </div>
          </div>
        </div>
      </main>

      {/* Debug Navigation */}
      <DebugNavigation currentView={currentView} onViewChange={setCurrentView} />
    </div>
  )
}
