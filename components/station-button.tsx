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
            ? "bg-[#8B4513] hover:bg-[#8B4513]/90 border-[#d4a574] border-2"
            : "bg-[#1a0d08] hover:bg-[#1a0d08]/80 border-[#8B4513]/30 border"
        }
        transition-all duration-200 active:scale-95
      `}
    >
      <div className="flex items-center gap-3 w-full">
        <Icon className="h-8 w-8 text-[#d4a574] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#d4a574] text-lg truncate">{title}</h3>
          <p className="text-sm text-gray-300 truncate">{stage}</p>
        </div>
        <div className="flex flex-col gap-1">
          {activeOrders > 0 && <Badge className="bg-[#d4a574] text-[#1a0d08] font-bold text-sm">{activeOrders}</Badge>}
          {activeBatches > 0 && <Badge className="bg-[#8B4513] text-white text-xs">{activeBatches} batches</Badge>}
        </div>
      </div>
    </Button>
  )
}
