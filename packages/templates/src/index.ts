// Export types
export * from './types'

// Export registry and utilities
export { TemplateRegistry, loadTemplate } from './registry'

// Export shared components
export * from './components/shared'

// Direct template exports (for static imports if needed)
export { default as SimpleClassicTemplate } from './basic/SimpleClassic'
export { default as ElegantBasicTemplate } from './basic/ElegantBasic'
export { default as LuxuryPremiumTemplate } from './premium/LuxuryPremium'
export { default as ModernPremiumTemplate } from './premium/ModernPremium'

// Utility function to get template metadata for database seeding
export { TemplateRegistry as TemplateMetadata } from './registry'
