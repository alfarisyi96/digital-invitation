'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTemplates } from '@/hooks/useTemplates'
import { InvitationType, TemplateStyle } from '@/types'
import { 
  ArrowLeft, 
  Search,
  Filter,
  Crown,
  Star,
  Eye,
  Heart,
  Sparkles,
  Check
} from 'lucide-react'

export default function TemplateSelectionPage() {
  const router = useRouter()
  const params = useParams()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const {
    templates,
    isLoading,
    selectedCategory,
    setSelectedCategory,
    selectedStyle,
    setSelectedStyle,
    showPremiumOnly,
    setShowPremiumOnly,
    searchQuery,
    setSearchQuery,
    getPopularTemplates
  } = useTemplates()

  const popularTemplates = getPopularTemplates(3)

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
  }

  const handleContinue = () => {
    if (selectedTemplate) {
      router.push(`/create/${params.id}/preview?template=${selectedTemplate}`)
    }
  }

  const getStyleIcon = (style: TemplateStyle) => {
    switch (style) {
      case TemplateStyle.ELEGANT:
        return <Crown className="w-4 h-4" />
      case TemplateStyle.MODERN:
        return <Sparkles className="w-4 h-4" />
      case TemplateStyle.FLORAL:
        return <Heart className="w-4 h-4" />
      default:
        return <Star className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: InvitationType) => {
    switch (category) {
      case InvitationType.WEDDING:
        return 'bg-rose-100 text-rose-700'
      case InvitationType.BIRTHDAY:
        return 'bg-yellow-100 text-yellow-700'
      case InvitationType.GRADUATION:
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Choose Template
            </h1>
            <div className="w-9 h-9" />
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          {/* Filter Row */}
          <div className="flex space-x-3 overflow-x-auto pb-2">
            <Select onValueChange={(value) => setSelectedCategory(value as any)}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={InvitationType.WEDDING}>Wedding</SelectItem>
                <SelectItem value={InvitationType.BIRTHDAY}>Birthday</SelectItem>
                <SelectItem value={InvitationType.GRADUATION}>Graduation</SelectItem>
                <SelectItem value={InvitationType.BABY_SHOWER}>Baby Shower</SelectItem>
                <SelectItem value={InvitationType.BUSINESS}>Business</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={(value) => setSelectedStyle(value as any)}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Styles</SelectItem>
                <SelectItem value={TemplateStyle.CLASSIC}>Classic</SelectItem>
                <SelectItem value={TemplateStyle.MODERN}>Modern</SelectItem>
                <SelectItem value={TemplateStyle.ELEGANT}>Elegant</SelectItem>
                <SelectItem value={TemplateStyle.FLORAL}>Floral</SelectItem>
                <SelectItem value={TemplateStyle.MINIMALIST}>Minimal</SelectItem>
                <SelectItem value={TemplateStyle.RUSTIC}>Rustic</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showPremiumOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPremiumOnly(!showPremiumOnly)}
              className="whitespace-nowrap h-9"
            >
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Button>
          </div>
        </div>
      </div>

      {/* Popular Templates Section */}
      {!searchQuery && selectedCategory === 'all' && selectedStyle === 'all' && !showPremiumOnly && (
        <div className="px-4 py-6 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-gray-100">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Popular Templates</h2>
            <p className="text-sm text-gray-600">Most loved by our users</p>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {popularTemplates.map((template) => (
              <div key={template.id} className="flex-shrink-0 w-40">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTemplate === template.id ? 'ring-2 ring-rose-500' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                        <span className="text-2xl">🎨</span>
                      </div>
                      {template.isPremium && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                            <Crown className="w-3 h-3" />
                            <span>PRO</span>
                          </div>
                        </div>
                      )}
                      {selectedTemplate === template.id && (
                        <div className="absolute inset-0 bg-rose-500 bg-opacity-20 rounded-t-lg flex items-center justify-center">
                          <div className="bg-rose-500 text-white rounded-full p-2">
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-900 truncate">{template.name}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-gray-600">{template.popularity}%</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(template.category)}`}>
                          {template.category}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Templates Grid */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            All Templates ({templates.length})
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="aspect-[3/4] bg-gray-200 rounded-t-lg"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSelectedStyle('all')
                setShowPremiumOnly(false)
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
            : "space-y-4"
          }>
            {templates.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate === template.id ? 'ring-2 ring-rose-500' : ''
                } ${viewMode === 'list' ? 'flex' : ''}`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent className={`p-0 ${viewMode === 'list' ? 'flex w-full' : ''}`}>
                  <div className={`relative ${viewMode === 'list' ? 'w-32 flex-shrink-0' : ''}`}>
                    <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${
                      viewMode === 'list' ? 'h-24 rounded-l-lg' : 'aspect-[3/4] rounded-t-lg'
                    }`}>
                      <span className="text-2xl">🎨</span>
                    </div>
                    
                    {template.isPremium && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>PRO</span>
                        </div>
                      </div>
                    )}
                    
                    {selectedTemplate === template.id && (
                      <div className={`absolute inset-0 bg-rose-500 bg-opacity-20 flex items-center justify-center ${
                        viewMode === 'list' ? 'rounded-l-lg' : 'rounded-t-lg'
                      }`}>
                        <div className="bg-rose-500 text-white rounded-full p-2">
                          <Check className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={viewMode === 'list' ? 'p-4 flex-1' : 'p-3'}>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-medium text-gray-900 ${viewMode === 'list' ? 'text-base' : 'text-sm'}`}>
                        {template.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {getStyleIcon(template.style)}
                      </div>
                    </div>
                    
                    {viewMode === 'list' && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-xs text-gray-600">{template.popularity}%</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                    </div>
                    
                    {viewMode === 'list' && template.features && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 3).map((feature, index) => (
                            <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                          {template.features.length > 3 && (
                            <span className="text-xs text-gray-500">+{template.features.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview & Continue Button */}
      {selectedTemplate && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                // TODO: Open preview modal
                console.log('Preview template:', selectedTemplate)
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
            >
              Use Template & Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
