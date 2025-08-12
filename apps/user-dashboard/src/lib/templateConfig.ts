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
// TODO: Create actual template components
export const TEMPLATE_COMPONENTS = {
  // 'sunda-traditional': () => import('@/templates/wedding/SundaTraditional'),
  // 'modern-minimalist': () => import('@/templates/wedding/ModernMinimalist'),
  // 'royal-wedding': () => import('@/templates/wedding/RoyalWedding'),
  // 'vibrant-birthday': () => import('@/templates/birthday/VibrantBirthday'),
  // 'professional-event': () => import('@/templates/business/ProfessionalEvent')
} as const

export type TemplateSlug = keyof typeof TEMPLATE_COMPONENTS

// Template loader utility
export const loadTemplate = async (templateSlug: string) => {
  // TODO: Implement when template components are created
  throw new Error(`Template not yet implemented: ${templateSlug}`)
  
  // const componentLoader = TEMPLATE_COMPONENTS[templateSlug as TemplateSlug]
  // if (!componentLoader) {
  //   throw new Error(`Template not found: ${templateSlug}`)
  // }
  // return await componentLoader()
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
