import React from 'react'
import { Button } from '@/components/ui/button'
import { EditorSidebar } from '@/components/create/molecules/EditorSidebar'
import { TemplatePreview } from '@/components/create/molecules/TemplatePreview'
import { Template, PackageType, WeddingFormData } from '@/services/supabaseService'

interface TemplateEditorProps {
  template: Template | undefined
  formData: WeddingFormData | null
  currentPackage: PackageType
  category: string
  onContinue?: () => void
}

/**
 * Template Editor Component - Step 4 in create flow
 * 
 * Features:
 * - Sidebar with typography and color controls
 * - Live preview with editable elements
 * - Auto-save to localStorage on every change
 * - Reset to template defaults
 */
export function TemplateEditor({
  template,
  formData,
  currentPackage,
  category,
  onContinue
}: TemplateEditorProps) {
  
  if (!template || !formData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please select a template first</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Customize Your Template
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Personalize your invitation with custom fonts, colors, and content
        </p>
      </div>

      {/* Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - 1/4 width on large screens */}
        <div className="lg:col-span-1">
          <EditorSidebar 
            template={template}
            currentPackage={currentPackage}
          />
        </div>

        {/* Preview Area - 3/4 width on large screens */}
        <div className="lg:col-span-3">
          <TemplatePreview
            template={template}
            formData={formData}
            category={category}
          />
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-6">
        <Button 
          onClick={onContinue}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
        >
          Continue to Preview
        </Button>
      </div>
    </div>
  )
}
