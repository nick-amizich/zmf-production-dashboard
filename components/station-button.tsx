"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface StationButtonProps {
  icon: LucideIcon
  title: string
  stage: string
  activeOrders: number
  activeBatches?: number
  isSelected?: boolean
  onClick: () => void
}

export function StationButton({
  icon: Icon,
  title,
  stage,
  activeOrders,
  activeBatches = 0,
  isSelected,
  onClick,
}: StationButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`
        h-24 w-full flex flex-col items-center justify-center gap-2 text-left
        ${
          isSelected
            ? "bg-theme-brand-secondary hover:bg-theme-brand-secondary/90 border-theme-text-secondary border-2"
            : "bg-theme-bg-secondary hover:bg-theme-bg-secondary/80 border-theme-border-primary border"
        }
        transition-all duration-200 active:scale-95
      `}
    >
      <div className="flex items-center gap-3 w-full">
        <Icon className="h-8 w-8 text-theme-text-secondary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-theme-text-secondary text-lg truncate">{title}</h3>
          <p className="text-sm text-theme-text-tertiary truncate">{stage}</p>
        </div>
        <div className="flex flex-col gap-1">
          {activeOrders > 0 && <Badge className="bg-theme-brand-primary text-theme-bg-secondary font-bold text-sm">{activeOrders}</Badge>}
          {activeBatches > 0 && <Badge className="bg-theme-brand-secondary text-theme-text-primary text-xs">{activeBatches} batches</Badge>}
        </div>
      </div>
    </Button>
  )
}
