'use client'

import { useState, useEffect } from 'react'
import { Template, InvitationType, TemplateStyle, TemplateColor, TemplateFont } from '@/types'

// Mock template data
const mockTemplates: Template[] = [
  {
    id: 'classic-rose',
    name: 'Classic Rose',
    category: InvitationType.WEDDING,
    thumbnail: '/api/placeholder/300/400',
    preview: '/api/placeholder/600/800',
    isPremium: false,
    style: TemplateStyle.CLASSIC,
    description: 'A timeless design with elegant rose motifs and classic typography',
    features: ['Elegant typography', 'Rose decorations', 'RSVP form', 'Timeline section'],
    popularity: 95,
    colors: [
      {
        name: 'Rose Gold',
        primary: '#E8B4B8',
        secondary: '#F5E6E8',
        accent: '#D4A574',
        background: '#FFFFFF'
      },
      {
        name: 'Deep Rose',
        primary: '#C4787C',
        secondary: '#E8B4B8',
        accent: '#8B4513',
        background: '#FFF8F8'
      }
    ],
    fonts: [
      {
        name: 'Playfair Display',
        family: 'serif',
        weights: ['400', '600', '700']
      },
      {
        name: 'Source Sans Pro',
        family: 'sans-serif',
        weights: ['300', '400', '600']
      }
    ]
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    category: InvitationType.WEDDING,
    thumbnail: '/api/placeholder/300/400',
    preview: '/api/placeholder/600/800',
    isPremium: true,
    style: TemplateStyle.MINIMALIST,
    description: 'Clean, modern design with plenty of white space and geometric elements',
    features: ['Clean layout', 'Geometric shapes', 'Modern typography', 'Mobile optimized'],
    popularity: 88,
    colors: [
      {
        name: 'Monochrome',
        primary: '#2D3748',
        secondary: '#E2E8F0',
        accent: '#4A5568',
        background: '#FFFFFF'
      },
      {
        name: 'Sage Green',
        primary: '#68D391',
        secondary: '#F0FFF4',
        accent: '#38A169',
        background: '#FAFAFA'
      }
    ],
    fonts: [
      {
        name: 'Inter',
        family: 'sans-serif',
        weights: ['300', '400', '500', '600']
      }
    ]
  },
  {
    id: 'floral-garden',
    name: 'Floral Garden',
    category: InvitationType.WEDDING,
    thumbnail: '/api/placeholder/300/400',
    preview: '/api/placeholder/600/800',
    isPremium: true,
    style: TemplateStyle.FLORAL,
    description: 'Beautiful botanical illustrations with watercolor-style backgrounds',
    features: ['Watercolor backgrounds', 'Botanical illustrations', 'Script fonts', 'Nature theme'],
    popularity: 92,
    colors: [
      {
        name: 'Garden Bloom',
        primary: '#9F7AEA',
        secondary: '#FAF5FF',
        accent: '#68D391',
        background: '#F7FAFC'
      },
      {
        name: 'Sunset Garden',
        primary: '#F6AD55',
        secondary: '#FFFAF0',
        accent: '#ED8936',
        background: '#FEFEFE'
      }
    ],
    fonts: [
      {
        name: 'Dancing Script',
        family: 'cursive',
        weights: ['400', '600', '700']
      },
      {
        name: 'Lato',
        family: 'sans-serif',
        weights: ['300', '400', '700']
      }
    ]
  },
  {
    id: 'elegant-gold',
    name: 'Elegant Gold',
    category: InvitationType.WEDDING,
    thumbnail: '/api/placeholder/300/400',
    preview: '/api/placeholder/600/800',
    isPremium: true,
    style: TemplateStyle.ELEGANT,
    description: 'Luxurious design with gold accents and sophisticated typography',
    features: ['Gold foil effects', 'Luxury typography', 'Ornate borders', 'Premium layout'],
    popularity: 90,
    colors: [
      {
        name: 'Champagne Gold',
        primary: '#D4A574',
        secondary: '#F7F3E9',
        accent: '#B8860B',
        background: '#FFFEF7'
      }
    ],
    fonts: [
      {
        name: 'Cormorant Garamond',
        family: 'serif',
        weights: ['300', '400', '600', '700']
      }
    ]
  },
  {
    id: 'rustic-wood',
    name: 'Rustic Wood',
    category: InvitationType.WEDDING,
    thumbnail: '/api/placeholder/300/400',
    preview: '/api/placeholder/600/800',
    isPremium: false,
    style: TemplateStyle.RUSTIC,
    description: 'Warm, natural design with wood textures and earthy colors',
    features: ['Wood textures', 'Natural colors', 'Handwritten fonts', 'Outdoor theme'],
    popularity: 78,
    colors: [
      {
        name: 'Forest',
        primary: '#8B4513',
        secondary: '#F5F5DC',
        accent: '#228B22',
        background: '#FFF8DC'
      }
    ],
    fonts: [
      {
        name: 'Kaushan Script',
        family: 'cursive',
        weights: ['400']
      },
      {
        name: 'Open Sans',
        family: 'sans-serif',
        weights: ['400', '600', '700']
      }
    ]
  },
  {
    id: 'birthday-fun',
    name: 'Birthday Fun',
    category: InvitationType.BIRTHDAY,
    thumbnail: '/api/placeholder/300/400',
    preview: '/api/placeholder/600/800',
    isPremium: false,
    style: TemplateStyle.MODERN,
    description: 'Colorful and playful design perfect for birthday celebrations',
    features: ['Bright colors', 'Fun animations', 'Balloon graphics', 'Party theme'],
    popularity: 85,
    colors: [
      {
        name: 'Rainbow Party',
        primary: '#FF6B6B',
        secondary: '#FFE66D',
        accent: '#4ECDC4',
        background: '#FFFFFF'
      }
    ],
    fonts: [
      {
        name: 'Fredoka One',
        family: 'cursive',
        weights: ['400']
      }
    ]
  }
]

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<InvitationType | 'all'>('all')
  const [selectedStyle, setSelectedStyle] = useState<TemplateStyle | 'all'>('all')
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Simulate API call
    const loadTemplates = async () => {
      try {
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 500))
        setTemplates(mockTemplates)
      } catch (error) {
        console.error('Failed to load templates:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplates()
  }, [])

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesStyle = selectedStyle === 'all' || template.style === selectedStyle
    const matchesPremium = !showPremiumOnly || template.isPremium
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesStyle && matchesPremium && matchesSearch
  })

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    // Premium templates first, then by popularity
    if (a.isPremium && !b.isPremium) return -1
    if (!a.isPremium && b.isPremium) return 1
    return b.popularity - a.popularity
  })

  const getTemplateById = (id: string): Template | undefined => {
    return templates.find(template => template.id === id)
  }

  const getPopularTemplates = (limit: number = 6): Template[] => {
    return templates
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit)
  }

  const getTemplatesByCategory = (category: InvitationType): Template[] => {
    return templates.filter(template => template.category === category)
  }

  return {
    templates: sortedTemplates,
    allTemplates: templates,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    selectedStyle,
    setSelectedStyle,
    showPremiumOnly,
    setShowPremiumOnly,
    searchQuery,
    setSearchQuery,
    getTemplateById,
    getPopularTemplates,
    getTemplatesByCategory
  }
}
