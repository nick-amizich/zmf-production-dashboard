"use client"

import { useState } from "react"
import { RoleSelectionCard } from "./components/role-selection-card"
import { SystemStatus } from "./components/system-status"
import { Settings, Monitor, Smartphone, Headphones, ArrowRight, BarChart3, Plus, Calendar, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DebugNavigation } from "./components/debug-navigation"

// Import the other interfaces
import ProductionManagerDashboard from "./production-manager-dashboard"
import MobileWorkerInterface from "./mobile-worker-interface"
import BatchManagement from "./batch-management"
import QualityControlDashboard from "./quality-control-dashboard"
import BatchOrderCreator from "./components/batch-order-creator"
import ProductionCalendar from "./production-calendar"
import OrderManagement from "./order-management"
import SimplifiedWorkerInterface from "./simplified-worker-interface"

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
          <Button onClick={handleBackToProductionMenu} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
            ← Back to Production Menu
          </Button>
          <Button
            onClick={handleBackToFront}
            variant="outline"
            className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513]/10"
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
          <Button onClick={handleBackToProductionMenu} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
            ← Back to Production Menu
          </Button>
          <Button
            onClick={handleBackToFront}
            variant="outline"
            className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513]/10"
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
          <Button onClick={handleBackToFront} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
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
          <Button onClick={handleBackToProductionMenu} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
            ← Back to Production Menu
          </Button>
          <Button
            onClick={handleBackToFront}
            variant="outline"
            className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513]/10"
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
          <Button onClick={handleBackToProductionMenu} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
            ← Back to Production Menu
          </Button>
          <Button
            onClick={handleBackToFront}
            variant="outline"
            className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513]/10"
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
          <Button onClick={handleBackToProductionMenu} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
            ← Back to Production Menu
          </Button>
          <Button
            onClick={handleBackToFront}
            variant="outline"
            className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513]/10"
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
          <Button onClick={handleBackToProductionMenu} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
            ← Back to Production Menu
          </Button>
          <Button
            onClick={handleBackToFront}
            variant="outline"
            className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513]/10"
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
          <Button onClick={handleBackToFront} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white">
        {/* Header */}
        <header className="border-b border-[#8B4513]/30 bg-[#1a0d08]/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button onClick={handleBackToFront} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
                  ← Back to Home
                </Button>
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#d4a574] rounded-lg flex items-center justify-center">
                  <Monitor className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-[#d4a574]">Production Management</h1>
                  <p className="text-gray-400 text-lg">Choose your management interface</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Management Interfaces</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
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
              gradient="bg-gradient-to-br from-[#8B4513] to-[#d4a574]"
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
              gradient="bg-gradient-to-br from-indigo-600 to-blue-600"
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
              gradient="bg-gradient-to-br from-blue-600 to-purple-600"
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
              gradient="bg-gradient-to-br from-orange-600 to-red-600"
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
              gradient="bg-gradient-to-br from-violet-600 to-purple-600"
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
              gradient="bg-gradient-to-br from-green-600 to-teal-600"
            />
          </div>

          {/* Quick Access Panel */}
          <div className="mt-16 max-w-5xl mx-auto">
            <Card className="bg-[#1a0d08]/50 border-[#8B4513]/30">
              <CardHeader>
                <CardTitle className="text-[#d4a574] text-center">Quick Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <Button
                    onClick={handleProductionDashboard}
                    variant="outline"
                    className="border-[#8B4513]/50 text-[#d4a574] hover:bg-[#8B4513]/20 h-auto py-4 flex flex-col gap-2"
                  >
                    <Monitor className="h-6 w-6" />
                    <span className="text-sm">Dashboard</span>
                  </Button>
                  <Button
                    onClick={handleProductionCalendar}
                    variant="outline"
                    className="border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/20 h-auto py-4 flex flex-col gap-2"
                  >
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Calendar</span>
                  </Button>
                  <Button
                    onClick={handleBatchManagement}
                    variant="outline"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 h-auto py-4 flex flex-col gap-2"
                  >
                    <ArrowRight className="h-6 w-6" />
                    <span className="text-sm">Batches</span>
                  </Button>
                  <Button
                    onClick={handleQualityDashboard}
                    variant="outline"
                    className="border-orange-500/50 text-orange-400 hover:bg-orange-500/20 h-auto py-4 flex flex-col gap-2"
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">Quality</span>
                  </Button>
                  <Button
                    onClick={handleOrderCreator}
                    variant="outline"
                    className="border-violet-500/50 text-violet-400 hover:bg-violet-500/20 h-auto py-4 flex flex-col gap-2"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">Create</span>
                  </Button>
                  <Button
                    onClick={handleOrderManagement}
                    variant="outline"
                    className="border-green-500/50 text-green-400 hover:bg-green-500/20 h-auto py-4 flex flex-col gap-2"
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white">
      {/* Header */}
      <header className="border-b border-[#8B4513]/30 bg-[#1a0d08]/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#8B4513] to-[#d4a574] rounded-lg flex items-center justify-center">
                <Headphones className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#d4a574]">ZMF Production System</h1>
                <p className="text-gray-400 text-lg">Premium Headphone Manufacturing Control</p>
              </div>
            </div>
            <Button variant="outline" className="border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Role</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
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
              gradient="bg-gradient-to-br from-[#8B4513] to-[#d4a574]"
            />

            {/* Sub-options preview */}
            <Card className="bg-[#1a0d08]/30 border-[#8B4513]/20">
              <CardContent className="p-4">
                <h4 className="text-[#d4a574] font-semibold mb-3 text-sm uppercase tracking-wide">
                  Management Tools Include:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Monitor className="h-3 w-3 text-[#8B4513]" />
                    <span>Production Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="h-3 w-3 text-indigo-400" />
                    <span>Production Calendar</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <ArrowRight className="h-3 w-3 text-blue-400" />
                    <span>Batch Management</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <BarChart3 className="h-3 w-3 text-orange-400" />
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
              gradient="bg-gradient-to-br from-green-600 to-teal-600"
            />

            {/* Worker features preview */}
            <Card className="bg-[#1a0d08]/30 border-green-600/20">
              <CardContent className="p-4">
                <h4 className="text-green-400 font-semibold mb-3 text-sm uppercase tracking-wide">Optimized For:</h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Workshop environment with gloves</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Variable lighting conditions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Offline capability for connectivity issues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
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
          <div className="bg-[#1a0d08]/50 rounded-lg p-6 max-w-4xl mx-auto border border-[#8B4513]/30">
            <h3 className="text-xl font-semibold text-[#d4a574] mb-3">About ZMF Production System</h3>
            <p className="text-gray-300 leading-relaxed">
              This quality-first production management system manages the complete workflow from raw materials to
              shipping across 7 production stages. Built specifically for ZMF's premium wooden headphone manufacturing
              process with comprehensive quality control at each stage.
            </p>
            <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-400">
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
