"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { LucideIcon } from "lucide-react"

interface RoleSelectionCardProps {
  title: string
  description: string
  icon: LucideIcon
  features: string[]
  buttonText: string
  onClick: () => void
  gradient: string
}

export function RoleSelectionCard({
  title,
  description,
  icon: Icon,
  features,
  buttonText,
  onClick,
  gradient,
}: RoleSelectionCardProps) {
  return (
    <Card className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all duration-300 group cursor-pointer">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          {/* Icon with gradient background */}
          <div
            className={`w-24 h-24 mx-auto rounded-full ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-12 w-12 text-theme-text-primary" />
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-theme-text-secondary">{title}</h2>
            <p className="text-theme-text-tertiary text-lg">{description}</p>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-left">
                <div className="w-2 h-2 bg-theme-brand-primary rounded-full flex-shrink-0" />
                <span className="text-theme-text-tertiary">{feature}</span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <Button
            onClick={onClick}
            className="w-full h-14 bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary text-lg font-semibold group-hover:bg-theme-brand-primary group-hover:text-theme-bg-secondary transition-all duration-300"
          >
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
