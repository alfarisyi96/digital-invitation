import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { TypographyPanel } from '@/components/create/atoms/TypographyPanel'
import { ColorPanel } from '@/components/create/atoms/ColorPanel'
import { Template, PackageType } from '@/services/supabaseService'
import { useTemplateCustomization } from '@/hooks/create/useTemplateCustomization'

interface EditorSidebarProps {
  template: Template
  currentPackage: PackageType
}

/**
 * Editor Sidebar Component
 * 
 * Contains:
 * - Typography controls (font family only)
 * - Color customization (primary, secondary, accent)
 * - Reset button (to template defaults)
 * 
 * Auto-saves to localStorage on every change
 */
export function EditorSidebar({ template, currentPackage }: EditorSidebarProps) {
  const {
    customization,
    updateFont,
    updateColors,
    resetToDefaults,
    isLoading
  } = useTemplateCustomization(template.id)

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Customize</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Typography Panel */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Typography</h3>
          <TypographyPanel
            selectedFontOption={customization?.selectedFontOption}
            onFontChange={updateFont}
            disabled={isLoading}
          />
        </div>

        {/* Color Panel */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Colors</h3>
          <ColorPanel
            template={template}
            selectedColorCombination={customization?.selectedColorCombination}
            onColorChange={updateColors}
            disabled={isLoading}
          />
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={resetToDefaults}
            disabled={isLoading}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
