// Utility functions to help with theme migration

// Mapping of old hardcoded colors to theme classes
export const colorMap = {
  // Backgrounds
  'bg-[#0a0a0a]': 'bg-theme-bg-primary',
  'bg-[#1a0d08]': 'bg-theme-bg-secondary',
  'bg-[#2a1510]': 'bg-theme-bg-tertiary',
  'bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08]': 'bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary',
  
  // Borders
  'border-[#8B4513]': 'border-theme-border-active',
  'border-[#8B4513]/30': 'border-theme-border-primary',
  'border-[#8B4513]/20': 'border-theme-border-secondary',
  'border-[#8B4513]/50': 'border-theme-border-primary',
  
  // Text
  'text-white': 'text-theme-text-primary',
  'text-[#d4a574]': 'text-theme-text-secondary',
  'text-gray-400': 'text-theme-text-tertiary',
  'text-gray-300': 'text-theme-text-tertiary',
  'text-gray-500': 'text-theme-text-tertiary',
  
  // Brand colors
  'text-[#8B4513]': 'text-theme-brand-secondary',
  'bg-[#8B4513]': 'bg-theme-brand-secondary',
  'bg-[#8B4513]/80': 'bg-theme-brand-hover',
  'bg-[#8B4513]/20': 'bg-theme-brand-secondary/20',
  'bg-[#8B4513]/10': 'bg-theme-brand-secondary/10',
  'hover:bg-[#8B4513]/80': 'hover:bg-theme-brand-hover',
  'hover:bg-[#8B4513]/20': 'hover:bg-theme-brand-secondary/20',
  'hover:bg-[#8B4513]/10': 'hover:bg-theme-brand-secondary/10',
  
  // Status colors
  'text-green-': 'text-theme-status-success',
  'text-amber-': 'text-theme-status-warning',
  'text-red-': 'text-theme-status-error',
  'text-blue-': 'text-theme-status-info',
  'bg-green-': 'bg-theme-status-success',
  'bg-amber-': 'bg-theme-status-warning',
  'bg-red-': 'bg-theme-status-error',
  'bg-blue-': 'bg-theme-status-info',
}

// Helper function to convert a className string
export function migrateClassNames(className: string): string {
  let updated = className
  
  Object.entries(colorMap).forEach(([old, replacement]) => {
    updated = updated.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement)
  })
  
  return updated
}

// Common theme-aware class combinations
export const themeClasses = {
  // Cards
  card: 'bg-theme-bg-secondary border-theme-border-primary',
  cardHover: 'hover:bg-theme-bg-tertiary hover:border-theme-border-active',
  
  // Buttons
  buttonPrimary: 'bg-theme-brand-secondary hover:bg-theme-brand-hover text-theme-text-primary',
  buttonSecondary: 'bg-theme-brand-secondary/20 hover:bg-theme-brand-secondary/30 text-theme-text-secondary border-theme-border-primary',
  buttonOutline: 'border-theme-border-primary text-theme-text-secondary hover:bg-theme-brand-secondary/20',
  
  // Inputs
  input: 'bg-theme-bg-primary border-theme-border-primary text-theme-text-primary placeholder-theme-text-tertiary',
  
  // Badges
  badge: 'bg-theme-brand-secondary/20 text-theme-text-secondary border-theme-border-primary',
  
  // Status
  success: 'text-theme-status-success bg-theme-status-success/10 border-theme-status-success/30',
  warning: 'text-theme-status-warning bg-theme-status-warning/10 border-theme-status-warning/30',
  error: 'text-theme-status-error bg-theme-status-error/10 border-theme-status-error/30',
  info: 'text-theme-status-info bg-theme-status-info/10 border-theme-status-info/30',
}