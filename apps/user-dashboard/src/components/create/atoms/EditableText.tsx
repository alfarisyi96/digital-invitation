import React, { useState, useEffect, useRef } from 'react'
import { Check, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EditableTextProps {
  textKey: string
  defaultValue: string
  className?: string
  style?: React.CSSProperties
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  templateId?: string
}

/**
 * Editable Text Component
 * 
 * Features:
 * - Click to edit inline
 * - Show check icon on edit
 * - Auto-save to localStorage on confirm
 * - Supports different HTML tags
 * - Proper cursor positioning
 */
export function EditableText({ 
  textKey, 
  defaultValue, 
  className = '', 
  style = {},
  tag = 'p',
  templateId
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [displayValue, setDisplayValue] = useState(defaultValue)
  const [hasChanges, setHasChanges] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)
  const currentValueRef = useRef(defaultValue)

  // Update display value when defaultValue changes
  useEffect(() => {
    setDisplayValue(defaultValue)
    currentValueRef.current = defaultValue
  }, [defaultValue])

  const saveToLocalStorage = (key: string, text: string) => {
    try {
      const existingCustomizations = JSON.parse(localStorage.getItem('templateCustomization') || '{}')
      const customTexts = existingCustomizations.customTexts || {}
      customTexts[key] = text
      
      localStorage.setItem('templateCustomization', JSON.stringify({
        ...existingCustomizations,
        customTexts
      }))
      
      console.log('💾 Text saved to localStorage:', { [key]: text })
    } catch (error) {
      console.error('Failed to save text to localStorage:', error)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    // Focus the element and set cursor to end after it becomes editable
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        
        // Move cursor to the end of the text
        const range = document.createRange()
        const selection = window.getSelection()
        range.selectNodeContents(inputRef.current)
        range.collapse(false) // false means collapse to end
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }, 0)
  }

  const handleSave = () => {
    const currentText = inputRef.current?.textContent || ''
    setIsEditing(false)
    setHasChanges(false)
    setDisplayValue(currentText)
    currentValueRef.current = currentText
    
    // Save to localStorage
    saveToLocalStorage(textKey, currentText)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
      setHasChanges(false)
      // Restore original text
      if (inputRef.current) {
        inputRef.current.textContent = displayValue
      }
    }
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.textContent || ''
    currentValueRef.current = newValue
    setHasChanges(newValue !== defaultValue)
    // Don't update displayValue here to avoid cursor jumping
  }

  const handleBlur = () => {
    // Don't auto-save on blur, require explicit save
    if (!hasChanges) {
      setIsEditing(false)
    }
  }

  return (
    <div className="relative group">
      <div
        ref={inputRef}
        className={`${className} ${isEditing ? 'ring-2 ring-blue-500 ring-opacity-50' : ''} cursor-pointer transition-all`}
        style={style}
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onClick={!isEditing ? handleEdit : undefined}
        role={tag}
      >
        {displayValue}
      </div>

      {/* Edit and Save Icons */}
      {!isEditing && (
        <Button
          size="sm"
          variant="outline"
          className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md"
          onClick={handleEdit}
        >
          <Edit3 className="w-3 h-3" />
        </Button>
      )}

      {isEditing && hasChanges && (
        <Button
          size="sm"
          className="absolute -bottom-2 -right-2 w-6 h-6 p-0 bg-green-600 hover:bg-green-700 text-white shadow-md"
          onClick={handleSave}
        >
          <Check className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}
