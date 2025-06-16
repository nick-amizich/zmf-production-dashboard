"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Users, Clock, Star, Zap, CheckCircle, AlertCircle, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"
import { logger } from "@/lib/logger"
import { format } from "date-fns"

type Batch = Database["public"]["Tables"]["batches"]["Row"]
type Worker = Database["public"]["Tables"]["workers"]["Row"]
type StageAssignment = Database["public"]["Tables"]["stage_assignments"]["Row"]
type WorkerAvailability = Database["public"]["Tables"]["worker_availability"]["Row"]
type ProductionStage = Database["public"]["Enums"]["production_stage"]

interface BatchWithDetails extends Batch {
  orders: {
    id: string
    order_number: string
    model_id: string | null
    headphone_models: {
      name: string
      model_code: string
    } | null
  }[]
  stage_assignments: (StageAssignment & {
    assigned_worker: Worker | null
  })[]
}

interface WorkerWithAvailability extends Worker {
  availability: WorkerAvailability[]
  current_assignments: number
  efficiency_scores: Record<ProductionStage, number>
}

interface BatchAssignmentViewProps {
  onBack: () => void
}

export default function BatchAssignmentView({ onBack }: BatchAssignmentViewProps) {
  const [batches, setBatches] = useState<BatchWithDetails[]>([])
  const [workers, setWorkers] = useState<WorkerWithAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [assignmentChanges, setAssignmentChanges] = useState<Record<string, string>>({})
  const supabase = createClient()

  useEffect(() => {
    loadBatchesAndWorkers()
  }, [])

  const loadBatchesAndWorkers = async () => {
    try {
      setLoading(true)

      // Load batches with details
      const { data: batchesData, error: batchesError } = await supabase
        .from("batches")
        .select(`
          *,
          batch_orders(
            order_id,
            orders(
              id,
              order_number,
              model_id,
              headphone_models(
                name
              )
            )
          ),
          stage_assignments(
            *,
            workers(*)
          )
        `)
        .eq("is_complete", false)
        .order("created_at", { ascending: false })

      if (batchesError) throw batchesError

      // Transform the data
      const transformedBatches = batchesData?.map(batch => ({
        ...batch,
        orders: batch.batch_orders?.map((bo: any) => bo.orders).filter(Boolean) || [],
        stage_assignments: batch.stage_assignments?.map((sa: any) => ({
          ...sa,
          assigned_worker: sa.workers || null
        })) || []
      })) || []

      setBatches(transformedBatches)

      // Load workers with availability
      const today = new Date()
      const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)

      const { data: workersData, error: workersError } = await supabase
        .from("workers")
        .select(`
          *,
          worker_availability(
            *
          ),
          stage_assignments(
            id,
            completed_at
          )
        `)
        .eq("is_active", true)

      if (workersError) throw workersError

      // Calculate worker scores and availability
      const workersWithScores = workersData?.map(worker => {
        const currentAssignments = worker.stage_assignments?.filter(
          (a: any) => !a.completed_at
        ).length || 0

        // Calculate efficiency scores based on specializations
        const efficiencyScores: Record<ProductionStage, number> = {} as any
        const stages: ProductionStage[] = ["Intake", "Sanding", "Finishing", "Sub-Assembly", "Final Assembly", "Acoustic QC", "Shipping"]
        
        stages.forEach(stage => {
          if (worker.specializations?.includes(stage)) {
            efficiencyScores[stage] = 3 // High efficiency for specialized skills
          } else {
            efficiencyScores[stage] = 1 // Low efficiency for non-specialized
          }
        })

        return {
          ...worker,
          availability: worker.worker_availability || [],
          current_assignments: currentAssignments,
          efficiency_scores: efficiencyScores
        }
      }) || []

      setWorkers(workersWithScores)
      setLoading(false)

    } catch (error) {
      logger.error("Failed to load batches and workers", error, { action: "loadBatchesAndWorkers" }, "BATCH_ASSIGNMENT")
      setLoading(false)
    }
  }

  const getAvailableWorkersForStage = (stage: ProductionStage): WorkerWithAvailability[] => {
    return workers.filter(worker => {
      // Check if worker has the specialization
      if (!worker.specializations?.includes(stage)) return false
      
      // Check if worker is available today
      const todayStr = format(new Date(), "yyyy-MM-dd")
      const todayAvailability = worker.availability.find(
        a => a.date === todayStr
      )
      if (!todayAvailability?.is_available) return false
      
      // Check workload (max 3 active assignments)
      if (worker.current_assignments >= 3) return false
      
      return true
    }).sort((a, b) => {
      // Sort by efficiency score for this stage
      return (b.efficiency_scores[stage] || 0) - (a.efficiency_scores[stage] || 0)
    })
  }

  const autoAssignWorkers = async (batchId: string) => {
    try {
      const batch = batches.find(b => b.id === batchId)
      if (!batch) return

      const assignments: Record<ProductionStage, string> = {} as any
      const stages: ProductionStage[] = ["Intake", "Sanding", "Finishing", "Sub-Assembly", "Final Assembly", "Acoustic QC", "Shipping"]

      // For each stage, find the best available worker
      for (const stage of stages) {
        const availableWorkers = getAvailableWorkersForStage(stage)
        if (availableWorkers.length > 0) {
          // Pick the worker with highest efficiency and lowest current assignments
          const bestWorker = availableWorkers[0]
          assignments[stage] = bestWorker.id
        }
      }

      // Save assignments
      for (const [stage, workerId] of Object.entries(assignments)) {
        await assignWorkerToStage(batchId, stage as ProductionStage, workerId)
      }

      logger.info("Batch auto-assigned", {
        batchId,
        assignmentCount: Object.keys(assignments).length
      }, "BATCH_ASSIGNMENT")

      // Reload data
      await loadBatchesAndWorkers()

    } catch (error) {
      logger.error("Failed to auto-assign workers", error, { action: "autoAssignWorkers", batchId }, "BATCH_ASSIGNMENT")
    }
  }

  const assignWorkerToStage = async (batchId: string, stage: ProductionStage, workerId: string) => {
    try {
      // Check if assignment already exists
      const { data: existing } = await supabase
        .from("stage_assignments")
        .select("id")
        .eq("batch_id", batchId)
        .eq("stage", stage)
        .single()

      if (existing) {
        // Update existing assignment
        const { error } = await supabase
          .from("stage_assignments")
          .update({
            assigned_worker_id: workerId,
            started_at: new Date().toISOString()
          })
          .eq("id", existing.id)

        if (error) throw error
      } else {
        // Create new assignment
        const { error } = await supabase
          .from("stage_assignments")
          .insert({
            batch_id: batchId,
            stage,
            assigned_worker_id: workerId,
            started_at: new Date().toISOString()
          })

        if (error) throw error
      }

      logger.info("Worker assigned to stage", {
        batchId,
        stage,
        workerId
      }, "BATCH_ASSIGNMENT")

    } catch (error) {
      logger.error("Failed to assign worker to stage", error, { 
        action: "assignWorkerToStage", 
        batchId, 
        stage, 
        workerId 
      }, "BATCH_ASSIGNMENT")
      throw error
    }
  }

  const saveAssignments = async () => {
    try {
      for (const [key, workerId] of Object.entries(assignmentChanges)) {
        const [batchId, stage] = key.split("-")
        await assignWorkerToStage(batchId, stage as ProductionStage, workerId)
      }

      setAssignmentChanges({})
      await loadBatchesAndWorkers()

    } catch (error) {
      logger.error("Failed to save assignments", error, { action: "saveAssignments" }, "BATCH_ASSIGNMENT")
    }
  }

  const getStageIcon = (stage: ProductionStage) => {
    const icons: Record<ProductionStage, string> = {
      "Intake": "📥",
      "Sanding": "🪚",
      "Finishing": "🎨",
      "Sub-Assembly": "🔧",
      "Final Assembly": "🎧",
      "Acoustic QC": "🔍",
      "Shipping": "📦"
    }
    return icons[stage] || "📋"
  }

  const getStageColor = (stage: ProductionStage) => {
    const colors: Record<ProductionStage, string> = {
      "Intake": "bg-blue-500",
      "Sanding": "bg-yellow-500",
      "Finishing": "bg-green-500",
      "Sub-Assembly": "bg-orange-500",
      "Final Assembly": "bg-purple-500",
      "Acoustic QC": "bg-pink-500",
      "Shipping": "bg-gray-500"
    }
    return colors[stage] || "bg-gray-400"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-brand-primary mx-auto"></div>
          <p className="mt-4 text-theme-text-tertiary">Loading batch assignments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-theme-text-tertiary mb-6">
          <Button 
            onClick={onBack}
            className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary h-10 px-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <span>→</span>
          <span>Batch Management</span>
          <span>→</span>
          <span className="text-theme-text-secondary">Batch Assignment</span>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-theme-text-secondary mb-2">Batch Work Assignment</h1>
            <p className="text-theme-text-tertiary">Assign workers to batch production stages</p>
          </div>
          {Object.keys(assignmentChanges).length > 0 && (
            <Button 
              onClick={saveAssignments}
              className="bg-theme-status-success hover:bg-green-700 text-white"
            >
              Save Changes ({Object.keys(assignmentChanges).length})
            </Button>
          )}
        </div>

        {/* Batch List */}
        <div className="space-y-6">
          {batches.map((batch) => (
            <Card key={batch.id} className="bg-theme-bg-secondary border-theme-border-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-theme-text-secondary">
                      {batch.batch_number}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-theme-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Created {format(new Date(batch.created_at!), "MMM dd, yyyy")}
                      </span>
                      <Badge className={`${
                        batch.priority === "expedite" ? "bg-red-500" :
                        batch.priority === "rush" ? "bg-orange-500" :
                        "bg-gray-500"
                      } text-white`}>
                        {batch.priority}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => autoAssignWorkers(batch.id)}
                    className="bg-theme-brand-primary hover:bg-theme-brand-primary/80 text-white"
                    size="sm"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Auto-Assign
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Order Details */}
                <div className="mb-4 p-3 bg-theme-bg-primary rounded border border-theme-border-secondary">
                  <p className="text-sm text-theme-text-tertiary mb-1">Orders in batch:</p>
                  <div className="flex flex-wrap gap-2">
                    {batch.orders.map((order) => (
                      <Badge key={order.id} variant="outline" className="text-theme-text-secondary">
                        {order.order_number} - {order.headphone_models?.name || "Unknown Model"}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stage Assignments */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(["Intake", "Sanding", "Finishing", "Sub-Assembly", "Final Assembly", "Acoustic QC", "Shipping"] as ProductionStage[]).map((stage) => {
                    const assignment = batch.stage_assignments.find(a => a.stage === stage)
                    const availableWorkers = getAvailableWorkersForStage(stage)
                    const assignmentKey = `${batch.id}-${stage}`
                    const selectedWorkerId = assignmentChanges[assignmentKey] || assignment?.assigned_worker_id || ""

                    return (
                      <div key={stage} className="bg-theme-bg-primary p-4 rounded border border-theme-border-secondary">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`p-2 rounded ${getStageColor(stage)} text-white`}>
                            {getStageIcon(stage)}
                          </span>
                          <span className="font-medium text-theme-text-secondary">{stage}</span>
                        </div>

                        <Select
                          value={selectedWorkerId || "unassigned"}
                          onValueChange={(value) => {
                            setAssignmentChanges(prev => ({
                              ...prev,
                              [assignmentKey]: value === "unassigned" ? "" : value
                            }))
                          }}
                        >
                          <SelectTrigger className="w-full bg-theme-bg-secondary border-theme-border-primary">
                            <SelectValue placeholder="Select worker">
                              {selectedWorkerId && selectedWorkerId !== "unassigned" ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback>
                                      {workers.find(w => w.id === selectedWorkerId)?.name.charAt(0) || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-theme-text-primary">
                                    {workers.find(w => w.id === selectedWorkerId)?.name || "Unknown"}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-theme-text-tertiary">Unassigned</span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {availableWorkers.map(worker => (
                              <SelectItem key={worker.id} value={worker.id}>
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback>{worker.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{worker.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {[...Array(worker.efficiency_scores[stage] || 1)].map((_, i) => (
                                      <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                    ))}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {assignment?.started_at && (
                          <div className="mt-2 text-xs text-theme-text-tertiary">
                            Started: {format(new Date(assignment.started_at), "MMM dd, HH:mm")}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {batches.length === 0 && (
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-theme-text-tertiary mx-auto mb-4" />
              <p className="text-theme-text-secondary text-lg">No batches need assignment</p>
              <p className="text-theme-text-tertiary mt-2">Create new batches from the order management screen</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}