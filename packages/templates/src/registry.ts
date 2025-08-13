import React from 'react'
import { TemplateComponent, TemplateMetadata } from './types'

// Dynamic imports for code splitting
const templateImports = {
  'simple-classic': () => import('./basic/SimpleClassic/index'),
  'elegant-basic': () => import('./basic/ElegantBasic/index'),
  'elegant-classic': () => import('./basic/ElegantBasic/index'), // Fallback to elegant-basic
  'modern-minimalist': () => import('./basic/SimpleClassic/index'), // Fallback to simple-classic
  'luxury-premium': () => import('./premium/LuxuryPremium/index'),
  'modern-premium': () => import('./premium/ModernPremium/index'),
} as const

export type TemplateSlug = keyof typeof templateImports

// Template registry for dynamic loading
export class TemplateRegistry {
  private static cache = new Map<string, TemplateComponent>()
  
  static async getTemplate(slug: string): Promise<TemplateComponent | null> {
    // Check cache first
    if (this.cache.has(slug)) {
      return this.cache.get(slug)!
    }
    
    // Dynamic import
    const importFn = templateImports[slug as TemplateSlug]
    if (!importFn) {
      console.warn(`Template not found: ${slug}`)
      return null
    }
    
    try {
      const module = await importFn()
      const TemplateComponent = module.default
      
      // Cache the component
      this.cache.set(slug, TemplateComponent)
      return TemplateComponent
    } catch (error) {
      console.error(`Failed to load template ${slug}:`, error)
      return null
    }
  }
  
  // Get template metadata (for database seeding)
  static getTemplateMetadata(): TemplateMetadata[] {
    return [
      {
        id: 'tpl_simple_classic_001',
        name: 'Simple Classic',
        slug: 'simple-classic',
        tier: 'basic',
        component_path: '@invitation/templates/basic/SimpleClassic',
        features: ['basic_info', 'ceremony_details'],
        thumbnail_url: '/templates/simple-classic/thumbnail.jpg',
        ornament_set: 'classic_floral'
      },
      {
        id: 'tpl_elegant_basic_001',
        name: 'Elegant Basic',
        slug: 'elegant-basic',
        tier: 'basic',
        component_path: '@invitation/templates/basic/ElegantBasic',
        features: ['basic_info', 'ceremony_details', 'elegant_typography'],
        thumbnail_url: '/templates/elegant-basic/thumbnail.jpg',
        ornament_set: 'elegant_borders'
      },
      {
        id: 'tpl_luxury_premium_001',
        name: 'Luxury Premium',
        slug: 'luxury-premium',
        tier: 'premium',
        component_path: '@invitation/templates/premium/LuxuryPremium',
        features: ['hero_image', 'couple_photos', 'gallery', 'rsvp_form', 'comments'],
        thumbnail_url: '/templates/luxury-premium/thumbnail.jpg',
        ornament_set: 'luxury_gold'
      },
      {
        id: 'tpl_modern_premium_001',
        name: 'Modern Premium',
        slug: 'modern-premium',
        tier: 'premium',
        component_path: '@invitation/templates/premium/ModernPremium',
        features: ['hero_image', 'couple_photos', 'gallery', 'rsvp_form', 'comments', 'parallax'],
        thumbnail_url: '/templates/modern-premium/thumbnail.jpg',
        ornament_set: 'modern_minimal'
      }
    ]
  }
}

// Utility function for apps to use
export async function loadTemplate(slug: string): Promise<TemplateComponent | null> {
  return TemplateRegistry.getTemplate(slug)
}
