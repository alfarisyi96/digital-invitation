import React from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Template, ColorCombination } from '@/services/supabaseService'

interface ColorPanelProps {
  template: Template
  selectedColorCombination?: ColorCombination
  onColorChange: (colorCombination: ColorCombination) => void
  disabled?: boolean
}

/**
 * Color Panel Component
 * 
 * Features:
 * - 3 color inputs (primary, secondary, accent)
 * - Template-specific color combination presets
 * - Auto-saves on change
 */
export function ColorPanel({ 
  template, 
  selectedColorCombination, 
  onColorChange, 
  disabled 
}: ColorPanelProps) {
  
  const currentColors = selectedColorCombination || template.color_combinations[0] || {
    name: 'Default',
    primary: '#374151',
    secondary: '#F9FAFB',
    accent: '#3B82F6'
  }

  const handleColorChange = (colorType: keyof Omit<ColorCombination, 'name'>, value: string) => {
    const updatedColors = {
      ...currentColors,
      [colorType]: value,
      name: 'Custom'
    }
    onColorChange(updatedColors)
  }

  const handlePresetSelect = (preset: ColorCombination) => {
    onColorChange(preset)
  }

  return (
    <div className="space-y-4">
      {/* Color Combination Presets */}
      {template.color_combinations && template.color_combinations.length > 0 && (
        <div>
          <Label className="text-sm mb-2 block">Color Combinations</Label>
          <div className="grid grid-cols-1 gap-2">
            {template.color_combinations.map((combination, index) => (
              <Button
                key={index}
                variant={currentColors.name === combination.name ? "default" : "outline"}
                size="sm"
                className="justify-start h-auto p-2"
                onClick={() => handlePresetSelect(combination)}
                disabled={disabled}
              >
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: combination.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: combination.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: combination.accent }}
                    />
                  </div>
                  <span className="text-xs">{combination.name}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Individual Color Controls */}
      <div className="space-y-3">
        <Label className="text-sm">Custom Colors</Label>
        
        {/* Primary Color */}
        <div className="flex items-center space-x-2">
          <Input
            type="color"
            value={currentColors.primary}
            onChange={(e) => handleColorChange('primary', e.target.value)}
            className="w-12 h-8 p-1 border-2"
            disabled={disabled}
          />
          <div className="flex-1">
            <Label className="text-xs text-gray-600">Primary</Label>
            <Input
              type="text"
              value={currentColors.primary}
              onChange={(e) => handleColorChange('primary', e.target.value)}
              className="h-8 text-xs font-mono"
              disabled={disabled}
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div className="flex items-center space-x-2">
          <Input
            type="color"
            value={currentColors.secondary}
            onChange={(e) => handleColorChange('secondary', e.target.value)}
            className="w-12 h-8 p-1 border-2"
            disabled={disabled}
          />
          <div className="flex-1">
            <Label className="text-xs text-gray-600">Secondary</Label>
            <Input
              type="text"
              value={currentColors.secondary}
              onChange={(e) => handleColorChange('secondary', e.target.value)}
              className="h-8 text-xs font-mono"
              disabled={disabled}
            />
          </div>
        </div>

        {/* Accent Color */}
        <div className="flex items-center space-x-2">
          <Input
            type="color"
            value={currentColors.accent}
            onChange={(e) => handleColorChange('accent', e.target.value)}
            className="w-12 h-8 p-1 border-2"
            disabled={disabled}
          />
          <div className="flex-1">
            <Label className="text-xs text-gray-600">Accent</Label>
            <Input
              type="text"
              value={currentColors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
              className="h-8 text-xs font-mono"
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
