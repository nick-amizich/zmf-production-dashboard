# ZMF Production Dashboard - Theming Guide

## Overview

The ZMF Production Dashboard now supports a comprehensive theming system that allows users to switch between different visual themes. The system uses CSS variables and Tailwind CSS custom properties for maximum performance and flexibility.

## Available Themes

### 1. **ZMF Luxury** (Default)
- The original wooden/luxury theme with warm browns and gold accents
- Perfect for the premium headphone aesthetic
- Colors: Brown (#8B4513), Gold (#d4a574), Dark backgrounds

### 2. **Modern Dark**
- Clean, modern dark theme with blue accents
- Professional appearance with high contrast
- Colors: Blue (#3b82f6), Dark grays, High contrast

### 3. **Professional Light**
- Light theme for well-lit environments
- Clean and minimal design
- Colors: Blue (#2563eb), White backgrounds, Gray accents

### 4. **Midnight Blue**
- Deep blue theme with purple accents
- Elegant night-time theme
- Colors: Indigo (#6366f1), Deep blues, Purple highlights

### 5. **Forest Green**
- Nature-inspired theme with green accents
- Calming and easy on the eyes
- Colors: Green (#22c55e), Dark greens, Natural tones

## How to Use Themes

### For Users

1. **Theme Switcher**: Click the "Theme" button in the top navigation bar
2. **Select Theme**: Choose from the available themes in the dropdown
3. **Instant Apply**: The theme changes immediately and is saved to your browser

### For Developers

#### Using Theme Colors in Components

Instead of hardcoded colors, use theme CSS variables:

```tsx
// ❌ Don't use hardcoded colors
<div className="bg-[#8B4513] text-white border-[#d4a574]">

// ✅ Use theme variables
<div className="bg-theme-brand-secondary text-theme-text-primary border-theme-brand-primary">
```

#### Available Theme Classes

**Backgrounds:**
- `bg-theme-bg-primary` - Main background
- `bg-theme-bg-secondary` - Card/panel backgrounds
- `bg-theme-bg-tertiary` - Nested content backgrounds

**Borders:**
- `border-theme-border-primary` - Main borders
- `border-theme-border-secondary` - Subtle borders
- `border-theme-border-active` - Active/focused borders

**Text:**
- `text-theme-text-primary` - Main text
- `text-theme-text-secondary` - Secondary/accent text
- `text-theme-text-tertiary` - Muted text

**Brand Colors:**
- `bg-theme-brand-primary` - Primary brand color
- `bg-theme-brand-secondary` - Secondary brand color
- `bg-theme-brand-hover` - Hover states

**Status Colors:**
- `text-theme-status-success` - Success states
- `text-theme-status-warning` - Warning states
- `text-theme-status-error` - Error states
- `text-theme-status-info` - Info states

## Creating New Themes

To add a new theme:

1. **Define the theme** in `/lib/themes/themes.ts`:

```typescript
export const myTheme: Theme = {
  name: 'my-theme',
  displayName: 'My Custom Theme',
  colors: {
    background: {
      primary: '#000000',
      secondary: '#111111',
      tertiary: '#222222',
      gradient: { from: '#000000', to: '#111111' }
    },
    // ... define all required colors
  }
}
```

2. **Add to themes export**:

```typescript
export const themes = {
  zmf: zmfTheme,
  dark: darkTheme,
  light: lightTheme,
  midnight: midnightTheme,
  forest: forestTheme,
  myTheme: myTheme // Add your theme here
}
```

## Migration Guide

### Automatic Migration

Run the migration script to automatically update components:

```bash
node scripts/migrate-to-theme.js ./components
```

### Manual Migration

Replace hardcoded colors with theme classes:

| Old Class | New Class |
|-----------|-----------|
| `bg-[#0a0a0a]` | `bg-theme-bg-primary` |
| `bg-[#1a0d08]` | `bg-theme-bg-secondary` |
| `border-[#8B4513]` | `border-theme-border-active` |
| `text-[#d4a574]` | `text-theme-text-secondary` |
| `text-white` | `text-theme-text-primary` |
| `text-gray-400` | `text-theme-text-tertiary` |

## Theme Context API

Access theme information programmatically:

```tsx
import { useTheme } from '@/lib/themes/theme-context'

function MyComponent() {
  const { theme, themeName, setTheme } = useTheme()
  
  // Get current theme colors
  console.log(theme.colors.brand.primary)
  
  // Change theme
  const switchToDark = () => setTheme('dark')
}
```

## Best Practices

1. **Always use theme classes** instead of hardcoded colors
2. **Test all themes** when making UI changes
3. **Consider contrast** - ensure text is readable in all themes
4. **Use semantic colors** - success/warning/error for status
5. **Respect user preference** - theme choice persists in localStorage

## CSS Variables Reference

All theme colors are available as CSS variables:

```css
/* Background colors */
--color-bg-primary
--color-bg-secondary
--color-bg-tertiary

/* Border colors */
--color-border-primary
--color-border-secondary
--color-border-active

/* Text colors */
--color-text-primary
--color-text-secondary
--color-text-tertiary

/* Brand colors */
--color-brand-primary
--color-brand-secondary
--color-brand-accent

/* Status colors */
--color-status-success
--color-status-warning
--color-status-error
--color-status-info
```

## Troubleshooting

### Theme not applying
1. Clear browser cache
2. Check localStorage for 'zmf-theme' key
3. Ensure ThemeProvider is wrapping your app

### Colors look wrong
1. Check you're using the correct theme class
2. Verify no hardcoded colors override theme
3. Test in different themes to isolate issue

### Adding theme support to new components
1. Import theme classes or use CSS variables
2. Test component in all themes
3. Ensure proper contrast ratios