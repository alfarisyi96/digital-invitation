import type { FontOption } from '@/services/supabaseService'

// Global font options available for all templates
export const GLOBAL_FONT_OPTIONS: FontOption[] = [
  {
    name: 'Elegant',
    heading: 'Playfair Display',
    body: 'Lora'
  },
  {
    name: 'Modern',
    heading: 'Montserrat',
    body: 'Open Sans'
  },
  {
    name: 'Classic',
    heading: 'Merriweather',
    body: 'Source Sans Pro'
  },
  {
    name: 'Minimal',
    heading: 'Inter',
    body: 'Inter'
  },
  {
    name: 'Romantic',
    heading: 'Dancing Script',
    body: 'Crimson Text'
  },
  {
    name: 'Professional',
    heading: 'Roboto Slab',
    body: 'Roboto'
  }
]

// Template resolver - maps slug to component import
export const TEMPLATE_COMPONENTS = {
  'sunda-traditional': () => import('@/components/templates/wedding/SundaTraditional'),
  'modern-minimalist': () => import('@/components/templates/wedding/ModernMinimalist'),
  'floral-romantic': () => import('@/components/templates/FloralRomantic'),
  'rustic-charm': () => import('@/components/templates/RusticCharm'),
  // Add more templates here as they're created
} as const

export type TemplateSlug = keyof typeof TEMPLATE_COMPONENTS

// Template loader utility
export const loadTemplate = async (templateSlug: string) => {
  const componentLoader = TEMPLATE_COMPONENTS[templateSlug as TemplateSlug]
  if (!componentLoader) {
    throw new Error(`Template not found: ${templateSlug}`)
  }
  const module = await componentLoader()
  return (module as any).default || module
}

// Default customization for new invitations
export const getDefaultCustomization = (template: any): any => {
  const defaultColorCombination = template.color_combinations?.[0] || {
    name: 'Default',
    primary: '#374151',
    secondary: '#F9FAFB',
    accent: '#3B82F6'
  }

  const defaultFontOption = GLOBAL_FONT_OPTIONS[0]

  return {
    selectedColorCombination: defaultColorCombination,
    selectedFontOption: defaultFontOption,
    customTexts: {},
    customImages: {}
  }
}
