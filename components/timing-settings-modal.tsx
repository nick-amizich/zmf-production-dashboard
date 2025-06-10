"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, RotateCcw, Clock, Zap, Star, Award } from "lucide-react"

interface TimingSettings {
  baseSandingTime: number
  woodTypeMultipliers: {
    standard: number
    cherry: number
    exotic: number
    stabilized: number
  }
  modelComplexity: {
    verite: number
    caldera: number
    atrium: number
  }
  workerExperience: {
    expert: number
    standard: number
    learning: number
  }
  baseAssemblyTime: number
  assemblyComplexity: {
    verite: number
    caldera: number
    atrium: number
  }
  hardwareComplexity: {
    standard: number
    premium: number
    custom: number
  }
}

interface TimingSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TimingSettingsModal({ open, onOpenChange }: TimingSettingsModalProps) {
  const [settings, setSettings] = useState<TimingSettings>({
    baseSandingTime: 40,
    woodTypeMultipliers: {
      standard: 1.0,
      cherry: 1.25,
      exotic: 1.75,
      stabilized: 2.0,
    },
    modelComplexity: {
      verite: 1.0,
      caldera: 1.2,
      atrium: 1.4,
    },
    workerExperience: {
      expert: 0.85,
      standard: 1.0,
      learning: 1.3,
    },
    baseAssemblyTime: 120,
    assemblyComplexity: {
      verite: 1.0,
      caldera: 1.5,
      atrium: 1.8,
    },
    hardwareComplexity: {
      standard: 1.0,
      premium: 1.2,
      custom: 1.6,
    },
  })

  const [hasChanges, setHasChanges] = useState(false)

  const updateSetting = (path: string, value: number) => {
    const keys = path.split(".")
    setSettings((prev) => {
      const newSettings = { ...prev }
      let current: any = newSettings

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value

      return newSettings
    })
    setHasChanges(true)
  }

  const resetDefaults = () => {
    setSettings({
      baseSandingTime: 40,
      woodTypeMultipliers: {
        standard: 1.0,
        cherry: 1.25,
        exotic: 1.75,
        stabilized: 2.0,
      },
      modelComplexity: {
        verite: 1.0,
        caldera: 1.2,
        atrium: 1.4,
      },
      workerExperience: {
        expert: 0.85,
        standard: 1.0,
        learning: 1.3,
      },
      baseAssemblyTime: 120,
      assemblyComplexity: {
        verite: 1.0,
        caldera: 1.5,
        atrium: 1.8,
      },
      hardwareComplexity: {
        standard: 1.0,
        premium: 1.2,
        custom: 1.6,
      },
    })
    setHasChanges(true)
  }

  const saveSettings = () => {
    // In real implementation, save to backend
    console.log("Saving settings:", settings)
    setHasChanges(false)

    // Show success notification
    alert("Settings saved successfully!")
  }

  const calculateSampleTime = () => {
    // Sample: Caldera Cocobolo, Expert Worker
    const baseTime = settings.baseSandingTime
    const modelMultiplier = settings.modelComplexity.caldera
    const woodMultiplier = settings.woodTypeMultipliers.exotic
    const workerMultiplier = settings.workerExperience.expert

    return Math.round(baseTime * modelMultiplier * woodMultiplier * workerMultiplier)
  }

  const formatMultiplier = (value: number) => {
    const percentage = Math.round((value - 1) * 100)
    if (percentage === 0) return "Base"
    return percentage > 0 ? `+${percentage}%` : `${percentage}%`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a0d08] border-[#8B4513]/30 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#d4a574] flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Production Timing Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sanding Stage Settings */}
          <Card className="bg-[#0a0a0a] border-[#8B4513]/30">
            <CardHeader>
              <CardTitle className="text-xl text-[#d4a574] flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Sanding Stage Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Base Sanding Time */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-white font-medium">Base Sanding Time per Unit</label>
                  <Badge className="bg-[#8B4513] text-white">{settings.baseSandingTime} minutes</Badge>
                </div>
                <Slider
                  value={[settings.baseSandingTime]}
                  onValueChange={([value]) => updateSetting("baseSandingTime", value)}
                  min={20}
                  max={60}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>20 min</span>
                  <span>60 min</span>
                </div>
              </div>

              <Separator className="bg-[#8B4513]/20" />

              {/* Wood Type Multipliers */}
              <div>
                <h4 className="text-white font-medium mb-4">Wood Type Multipliers</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Cherry/Walnut</span>
                      <Badge className="bg-amber-600 text-white">
                        {settings.woodTypeMultipliers.cherry}x ({formatMultiplier(settings.woodTypeMultipliers.cherry)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.woodTypeMultipliers.cherry]}
                      onValueChange={([value]) => updateSetting("woodTypeMultipliers.cherry", value)}
                      min={1.0}
                      max={2.0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Cocobolo/Katalox</span>
                      <Badge className="bg-red-600 text-white">
                        {settings.woodTypeMultipliers.exotic}x ({formatMultiplier(settings.woodTypeMultipliers.exotic)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.woodTypeMultipliers.exotic]}
                      onValueChange={([value]) => updateSetting("woodTypeMultipliers.exotic", value)}
                      min={1.0}
                      max={3.0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Stabilized Wood</span>
                      <Badge className="bg-purple-600 text-white">
                        {settings.woodTypeMultipliers.stabilized}x (
                        {formatMultiplier(settings.woodTypeMultipliers.stabilized)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.woodTypeMultipliers.stabilized]}
                      onValueChange={([value]) => updateSetting("woodTypeMultipliers.stabilized", value)}
                      min={1.0}
                      max={3.0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-[#8B4513]/20" />

              {/* Model Complexity */}
              <div>
                <h4 className="text-white font-medium mb-4">Model Complexity</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Verite</span>
                      <Badge className="bg-blue-600 text-white">
                        {settings.modelComplexity.verite}x ({formatMultiplier(settings.modelComplexity.verite)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.modelComplexity.verite]}
                      onValueChange={([value]) => updateSetting("modelComplexity.verite", value)}
                      min={0.8}
                      max={1.5}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Caldera</span>
                      <Badge className="bg-green-600 text-white">
                        {settings.modelComplexity.caldera}x ({formatMultiplier(settings.modelComplexity.caldera)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.modelComplexity.caldera]}
                      onValueChange={([value]) => updateSetting("modelComplexity.caldera", value)}
                      min={0.8}
                      max={1.8}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Atrium</span>
                      <Badge className="bg-orange-600 text-white">
                        {settings.modelComplexity.atrium}x ({formatMultiplier(settings.modelComplexity.atrium)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.modelComplexity.atrium]}
                      onValueChange={([value]) => updateSetting("modelComplexity.atrium", value)}
                      min={0.8}
                      max={2.0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-[#8B4513]/20" />

              {/* Worker Experience */}
              <div>
                <h4 className="text-white font-medium mb-4">Worker Experience Multipliers</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        Expert (Jake, Tony)
                      </span>
                      <Badge className="bg-yellow-600 text-white">
                        {settings.workerExperience.expert}x ({formatMultiplier(settings.workerExperience.expert)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.workerExperience.expert]}
                      onValueChange={([value]) => updateSetting("workerExperience.expert", value)}
                      min={0.6}
                      max={1.0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Standard Workers</span>
                      <Badge className="bg-gray-600 text-white">
                        {settings.workerExperience.standard}x ({formatMultiplier(settings.workerExperience.standard)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.workerExperience.standard]}
                      onValueChange={([value]) => updateSetting("workerExperience.standard", value)}
                      min={0.8}
                      max={1.2}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Learning Workers</span>
                      <Badge className="bg-blue-600 text-white">
                        {settings.workerExperience.learning}x ({formatMultiplier(settings.workerExperience.learning)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.workerExperience.learning]}
                      onValueChange={([value]) => updateSetting("workerExperience.learning", value)}
                      min={1.0}
                      max={1.8}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final Assembly Settings */}
          <Card className="bg-[#0a0a0a] border-[#8B4513]/30">
            <CardHeader>
              <CardTitle className="text-xl text-[#d4a574] flex items-center gap-2">
                <Award className="h-5 w-5" />
                Final Assembly Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Base Assembly Time */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-white font-medium">Base Assembly Time per Unit</label>
                  <Badge className="bg-[#8B4513] text-white">{settings.baseAssemblyTime} minutes</Badge>
                </div>
                <Slider
                  value={[settings.baseAssemblyTime]}
                  onValueChange={([value]) => updateSetting("baseAssemblyTime", value)}
                  min={60}
                  max={240}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>60 min</span>
                  <span>240 min</span>
                </div>
              </div>

              <Separator className="bg-[#8B4513]/20" />

              {/* Assembly Complexity */}
              <div>
                <h4 className="text-white font-medium mb-4">Model Assembly Complexity</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Verite</span>
                      <Badge className="bg-blue-600 text-white">
                        {settings.assemblyComplexity.verite}x ({formatMultiplier(settings.assemblyComplexity.verite)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.assemblyComplexity.verite]}
                      onValueChange={([value]) => updateSetting("assemblyComplexity.verite", value)}
                      min={0.8}
                      max={1.5}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Caldera</span>
                      <Badge className="bg-green-600 text-white">
                        {settings.assemblyComplexity.caldera}x ({formatMultiplier(settings.assemblyComplexity.caldera)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.assemblyComplexity.caldera]}
                      onValueChange={([value]) => updateSetting("assemblyComplexity.caldera", value)}
                      min={1.0}
                      max={2.0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Atrium</span>
                      <Badge className="bg-orange-600 text-white">
                        {settings.assemblyComplexity.atrium}x ({formatMultiplier(settings.assemblyComplexity.atrium)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.assemblyComplexity.atrium]}
                      onValueChange={([value]) => updateSetting("assemblyComplexity.atrium", value)}
                      min={1.0}
                      max={2.5}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Separator className="bg-[#8B4513]/20" />

              {/* Hardware Complexity */}
              <div>
                <h4 className="text-white font-medium mb-4">Hardware Complexity</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Standard Hardware</span>
                      <Badge className="bg-gray-600 text-white">
                        {settings.hardwareComplexity.standard}x (
                        {formatMultiplier(settings.hardwareComplexity.standard)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.hardwareComplexity.standard]}
                      onValueChange={([value]) => updateSetting("hardwareComplexity.standard", value)}
                      min={0.8}
                      max={1.2}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Premium Hardware</span>
                      <Badge className="bg-amber-600 text-white">
                        {settings.hardwareComplexity.premium}x ({formatMultiplier(settings.hardwareComplexity.premium)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.hardwareComplexity.premium]}
                      onValueChange={([value]) => updateSetting("hardwareComplexity.premium", value)}
                      min={1.0}
                      max={1.5}
                      step={0.05}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Custom Hardware</span>
                      <Badge className="bg-red-600 text-white">
                        {settings.hardwareComplexity.custom}x ({formatMultiplier(settings.hardwareComplexity.custom)})
                      </Badge>
                    </div>
                    <Slider
                      value={[settings.hardwareComplexity.custom]}
                      onValueChange={([value]) => updateSetting("hardwareComplexity.custom", value)}
                      min={1.2}
                      max={2.0}
                      step={0.05}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Calculation Preview */}
          <Card className="bg-gradient-to-r from-[#8B4513]/20 to-[#d4a574]/10 border-[#d4a574]/30">
            <CardHeader>
              <CardTitle className="text-xl text-[#d4a574] flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Real-time Calculation Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">Sample: Caldera Cocobolo, Expert Worker</h3>
                  <div className="text-3xl font-bold text-[#d4a574] mb-2">{calculateSampleTime()} minutes</div>
                  <div className="text-sm text-gray-400">
                    {settings.baseSandingTime}min × {settings.modelComplexity.caldera} ×{" "}
                    {settings.woodTypeMultipliers.exotic} × {settings.workerExperience.expert} = {calculateSampleTime()}{" "}
                    minutes
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-center text-sm">
                  <div>
                    <div className="text-gray-400">Base Time</div>
                    <div className="text-white font-medium">{settings.baseSandingTime}min</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Model</div>
                    <div className="text-white font-medium">{settings.modelComplexity.caldera}x</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Wood Type</div>
                    <div className="text-white font-medium">{settings.woodTypeMultipliers.exotic}x</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Worker</div>
                    <div className="text-white font-medium">{settings.workerExperience.expert}x</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={saveSettings}
              disabled={!hasChanges}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Settings
            </Button>

            <Button
              onClick={resetDefaults}
              variant="outline"
              className="h-12 border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset Defaults
            </Button>

            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="h-12 border-gray-500 text-gray-300 hover:bg-gray-500/20"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
