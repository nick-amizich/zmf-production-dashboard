export interface Theme {
  name: string
  displayName: string
  colors: {
    // Background colors
    background: {
      primary: string      // Main background
      secondary: string    // Card/panel background
      tertiary: string     // Nested content background
      gradient: {
        from: string
        to: string
      }
    }
    
    // Border colors
    border: {
      primary: string      // Main borders
      secondary: string    // Subtle borders
      active: string       // Active/focused borders
    }
    
    // Text colors
    text: {
      primary: string      // Main text
      secondary: string    // Muted text
      tertiary: string     // Very muted text
      inverse: string      // Text on dark backgrounds
    }
    
    // Brand colors
    brand: {
      primary: string      // Main brand color
      secondary: string    // Secondary brand color
      accent: string       // Accent color
      hover: string        // Hover states
    }
    
    // Status colors
    status: {
      success: string
      warning: string
      error: string
      info: string
    }
    
    // UI element colors
    ui: {
      buttonPrimary: string
      buttonSecondary: string
      buttonHover: string
      badge: string
      progress: string
      input: string
      inputBorder: string
    }
  }
}

// ZMF Original Theme (Current wooden/luxury theme)
export const zmfTheme: Theme = {
  name: 'zmf',
  displayName: 'ZMF Luxury',
  colors: {
    background: {
      primary: '#0a0a0a',
      secondary: '#1a0d08',
      tertiary: '#2a1510',
      gradient: {
        from: '#0a0a0a',
        to: '#1a0d08'
      }
    },
    border: {
      primary: 'rgba(139, 69, 19, 0.3)',   // #8B4513 with opacity
      secondary: 'rgba(139, 69, 19, 0.2)',
      active: '#8B4513'
    },
    text: {
      primary: '#ffffff',
      secondary: '#d4a574',
      tertiary: '#9ca3af',
      inverse: '#000000'
    },
    brand: {
      primary: '#d4a574',
      secondary: '#8B4513',
      accent: '#daa520',
      hover: 'rgba(139, 69, 19, 0.8)'
    },
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    ui: {
      buttonPrimary: '#8B4513',
      buttonSecondary: 'rgba(139, 69, 19, 0.2)',
      buttonHover: 'rgba(139, 69, 19, 0.8)',
      badge: '#8B4513',
      progress: '#d4a574',
      input: '#0a0a0a',
      inputBorder: 'rgba(139, 69, 19, 0.3)'
    }
  }
}

// Modern Dark Theme
export const darkTheme: Theme = {
  name: 'dark',
  displayName: 'Modern Dark',
  colors: {
    background: {
      primary: '#09090b',
      secondary: '#18181b',
      tertiary: '#27272a',
      gradient: {
        from: '#09090b',
        to: '#18181b'
      }
    },
    border: {
      primary: 'rgba(63, 63, 70, 0.5)',
      secondary: 'rgba(63, 63, 70, 0.3)',
      active: '#52525b'
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      tertiary: '#71717a',
      inverse: '#09090b'
    },
    brand: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      hover: 'rgba(59, 130, 246, 0.8)'
    },
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    ui: {
      buttonPrimary: '#3b82f6',
      buttonSecondary: 'rgba(59, 130, 246, 0.1)',
      buttonHover: 'rgba(59, 130, 246, 0.8)',
      badge: '#3b82f6',
      progress: '#3b82f6',
      input: '#18181b',
      inputBorder: 'rgba(63, 63, 70, 0.5)'
    }
  }
}

// Light Professional Theme
export const lightTheme: Theme = {
  name: 'light',
  displayName: 'Professional Light',
  colors: {
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      gradient: {
        from: '#ffffff',
        to: '#f9fafb'
      }
    },
    border: {
      primary: 'rgba(209, 213, 219, 1)',
      secondary: 'rgba(229, 231, 235, 1)',
      active: '#9ca3af'
    },
    text: {
      primary: '#111827',
      secondary: '#4b5563',
      tertiary: '#9ca3af',
      inverse: '#ffffff'
    },
    brand: {
      primary: '#2563eb',
      secondary: '#1d4ed8',
      accent: '#3b82f6',
      hover: 'rgba(37, 99, 235, 0.9)'
    },
    status: {
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      info: '#2563eb'
    },
    ui: {
      buttonPrimary: '#2563eb',
      buttonSecondary: 'rgba(37, 99, 235, 0.05)',
      buttonHover: 'rgba(37, 99, 235, 0.9)',
      badge: '#2563eb',
      progress: '#2563eb',
      input: '#ffffff',
      inputBorder: 'rgba(209, 213, 219, 1)'
    }
  }
}

// Midnight Blue Theme
export const midnightTheme: Theme = {
  name: 'midnight',
  displayName: 'Midnight Blue',
  colors: {
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      gradient: {
        from: '#0f172a',
        to: '#1e293b'
      }
    },
    border: {
      primary: 'rgba(71, 85, 105, 0.5)',
      secondary: 'rgba(71, 85, 105, 0.3)',
      active: '#64748b'
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      inverse: '#0f172a'
    },
    brand: {
      primary: '#6366f1',
      secondary: '#4f46e5',
      accent: '#818cf8',
      hover: 'rgba(99, 102, 241, 0.8)'
    },
    status: {
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa'
    },
    ui: {
      buttonPrimary: '#6366f1',
      buttonSecondary: 'rgba(99, 102, 241, 0.1)',
      buttonHover: 'rgba(99, 102, 241, 0.8)',
      badge: '#6366f1',
      progress: '#6366f1',
      input: '#1e293b',
      inputBorder: 'rgba(71, 85, 105, 0.5)'
    }
  }
}

// Forest Green Theme
export const forestTheme: Theme = {
  name: 'forest',
  displayName: 'Forest Green',
  colors: {
    background: {
      primary: '#0a0f0a',
      secondary: '#14291d',
      tertiary: '#1e3a2a',
      gradient: {
        from: '#0a0f0a',
        to: '#14291d'
      }
    },
    border: {
      primary: 'rgba(34, 197, 94, 0.3)',
      secondary: 'rgba(34, 197, 94, 0.2)',
      active: '#22c55e'
    },
    text: {
      primary: '#f0fdf4',
      secondary: '#86efac',
      tertiary: '#bbf7d0',
      inverse: '#0a0f0a'
    },
    brand: {
      primary: '#22c55e',
      secondary: '#16a34a',
      accent: '#4ade80',
      hover: 'rgba(34, 197, 94, 0.8)'
    },
    status: {
      success: '#4ade80',
      warning: '#facc15',
      error: '#f87171',
      info: '#38bdf8'
    },
    ui: {
      buttonPrimary: '#22c55e',
      buttonSecondary: 'rgba(34, 197, 94, 0.1)',
      buttonHover: 'rgba(34, 197, 94, 0.8)',
      badge: '#22c55e',
      progress: '#22c55e',
      input: '#14291d',
      inputBorder: 'rgba(34, 197, 94, 0.3)'
    }
  }
}

// Export all themes
export const themes = {
  zmf: zmfTheme,
  dark: darkTheme,
  light: lightTheme,
  midnight: midnightTheme,
  forest: forestTheme
}

export type ThemeName = keyof typeof themes

// Helper function to apply theme to CSS variables
export function applyTheme(theme: Theme) {
  const root = document.documentElement
  
  // Background colors
  root.style.setProperty('--color-bg-primary', theme.colors.background.primary)
  root.style.setProperty('--color-bg-secondary', theme.colors.background.secondary)
  root.style.setProperty('--color-bg-tertiary', theme.colors.background.tertiary)
  root.style.setProperty('--color-bg-gradient-from', theme.colors.background.gradient.from)
  root.style.setProperty('--color-bg-gradient-to', theme.colors.background.gradient.to)
  
  // Border colors
  root.style.setProperty('--color-border-primary', theme.colors.border.primary)
  root.style.setProperty('--color-border-secondary', theme.colors.border.secondary)
  root.style.setProperty('--color-border-active', theme.colors.border.active)
  
  // Text colors
  root.style.setProperty('--color-text-primary', theme.colors.text.primary)
  root.style.setProperty('--color-text-secondary', theme.colors.text.secondary)
  root.style.setProperty('--color-text-tertiary', theme.colors.text.tertiary)
  root.style.setProperty('--color-text-inverse', theme.colors.text.inverse)
  
  // Brand colors
  root.style.setProperty('--color-brand-primary', theme.colors.brand.primary)
  root.style.setProperty('--color-brand-secondary', theme.colors.brand.secondary)
  root.style.setProperty('--color-brand-accent', theme.colors.brand.accent)
  root.style.setProperty('--color-brand-hover', theme.colors.brand.hover)
  
  // Status colors
  root.style.setProperty('--color-status-success', theme.colors.status.success)
  root.style.setProperty('--color-status-warning', theme.colors.status.warning)
  root.style.setProperty('--color-status-error', theme.colors.status.error)
  root.style.setProperty('--color-status-info', theme.colors.status.info)
  
  // UI element colors
  root.style.setProperty('--color-ui-button-primary', theme.colors.ui.buttonPrimary)
  root.style.setProperty('--color-ui-button-secondary', theme.colors.ui.buttonSecondary)
  root.style.setProperty('--color-ui-button-hover', theme.colors.ui.buttonHover)
  root.style.setProperty('--color-ui-badge', theme.colors.ui.badge)
  root.style.setProperty('--color-ui-progress', theme.colors.ui.progress)
  root.style.setProperty('--color-ui-input', theme.colors.ui.input)
  root.style.setProperty('--color-ui-input-border', theme.colors.ui.inputBorder)
}