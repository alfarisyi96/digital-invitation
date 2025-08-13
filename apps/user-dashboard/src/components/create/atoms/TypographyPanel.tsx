import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FontOption } from '@/services/supabaseService'
import { GLOBAL_FONT_OPTIONS } from '@/lib/templateConfig'

interface TypographyPanelProps {
  selectedFontOption?: FontOption
  onFontChange: (fontOption: FontOption) => void
  disabled?: boolean
}

/**
 * Typography Panel Component
 * 
 * Features:
 * - Font family selection only (no size/weight controls)
 * - Uses global font options
 * - Auto-saves on change
 */
export function TypographyPanel({ 
  selectedFontOption, 
  onFontChange, 
  disabled 
}: TypographyPanelProps) {
  
  const handleFontSelect = (fontName: string) => {
    const selectedFont = GLOBAL_FONT_OPTIONS.find(font => font.name === fontName)
    if (selectedFont) {
      onFontChange(selectedFont)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="font-family" className="text-sm">Font Family</Label>
        <Select
          value={selectedFontOption?.name || GLOBAL_FONT_OPTIONS[0].name}
          onValueChange={handleFontSelect}
          disabled={disabled}
        >
          <SelectTrigger id="font-family" className="mt-1">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            {GLOBAL_FONT_OPTIONS.map((font) => (
              <SelectItem key={font.name} value={font.name}>
                <div className="flex flex-col">
                  <span className="font-medium">{font.name}</span>
                  <span className="text-xs text-gray-500">
                    {font.heading} • {font.body}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Preview */}
      {selectedFontOption && (
        <div className="p-3 bg-gray-50 rounded-lg text-sm">
          <div 
            className="font-semibold mb-1"
            style={{ fontFamily: selectedFontOption.heading }}
          >
            Heading Sample
          </div>
          <div 
            className="text-gray-600"
            style={{ fontFamily: selectedFontOption.body }}
          >
            Body text sample
          </div>
        </div>
      )}
    </div>
  )
}
