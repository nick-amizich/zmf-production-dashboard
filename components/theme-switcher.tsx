'use client'

import { useTheme } from '@/lib/themes/theme-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Palette, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ThemeSwitcher() {
  const { themeName, setTheme, availableThemes } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-theme-border-primary text-theme-text-secondary hover:bg-theme-brand-secondary/20"
        >
          <Palette className="h-4 w-4 mr-2" />
          Theme
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-theme-bg-secondary border-theme-border-primary"
      >
        <DropdownMenuLabel className="text-theme-text-secondary">
          Choose Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-theme-border-secondary" />
        {Object.entries(availableThemes).map(([key, theme]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setTheme(key as any)}
            className={cn(
              "cursor-pointer text-theme-text-primary hover:bg-theme-brand-secondary/20",
              "focus:bg-theme-brand-secondary/20"
            )}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div 
                  className="w-6 h-6 rounded-md border border-theme-border-primary"
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors.brand.primary} 0%, ${theme.colors.brand.secondary} 100%)`
                  }}
                />
                <span>{theme.displayName}</span>
              </div>
              {themeName === key && (
                <Check className="h-4 w-4 text-theme-brand-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Preview component to show in settings
export function ThemePreview() {
  const { themeName, setTheme, availableThemes } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-theme-text-primary mb-4">
          Theme Selection
        </h3>
        <p className="text-sm text-theme-text-tertiary mb-6">
          Choose a theme that suits your preference. Changes are applied immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(availableThemes).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => setTheme(key as any)}
            className={cn(
              "group relative overflow-hidden rounded-lg border-2 transition-all",
              themeName === key
                ? "border-theme-brand-primary shadow-lg"
                : "border-theme-border-primary hover:border-theme-border-active"
            )}
          >
            {/* Theme preview */}
            <div 
              className="aspect-video p-4"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.background.gradient.from} 0%, ${theme.colors.background.gradient.to} 100%)`
              }}
            >
              <div className="space-y-2">
                <div 
                  className="h-2 w-20 rounded"
                  style={{ backgroundColor: theme.colors.brand.primary }}
                />
                <div 
                  className="h-2 w-32 rounded opacity-50"
                  style={{ backgroundColor: theme.colors.text.secondary }}
                />
                <div className="flex gap-2 mt-4">
                  <div 
                    className="h-8 w-8 rounded"
                    style={{ backgroundColor: theme.colors.ui.buttonPrimary }}
                  />
                  <div 
                    className="h-8 w-8 rounded"
                    style={{ backgroundColor: theme.colors.status.success }}
                  />
                  <div 
                    className="h-8 w-8 rounded"
                    style={{ backgroundColor: theme.colors.status.warning }}
                  />
                  <div 
                    className="h-8 w-8 rounded"
                    style={{ backgroundColor: theme.colors.status.error }}
                  />
                </div>
              </div>
            </div>
            
            {/* Theme name */}
            <div 
              className="px-4 py-2 border-t"
              style={{ 
                backgroundColor: theme.colors.background.secondary,
                borderColor: theme.colors.border.primary 
              }}
            >
              <div className="flex items-center justify-between">
                <span 
                  className="font-medium"
                  style={{ color: theme.colors.text.primary }}
                >
                  {theme.displayName}
                </span>
                {themeName === key && (
                  <Check 
                    className="h-4 w-4" 
                    style={{ color: theme.colors.brand.primary }}
                  />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}