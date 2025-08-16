import React from 'react'

export { RSVPSection } from './RSVPSection'
export { CommentsSection } from './CommentsSection'

interface SectionProps {
  name: string
  className?: string
  children: React.ReactNode
}

export function Section({ name, className = '', children }: SectionProps) {
  return (
    <section 
      data-section={name}
      className={`template-section template-section-${name} ${className}`}
    >
      {children}
    </section>
  )
}

interface EditableTextProps {
  value: string
  onChange?: (value: string) => void
  className?: string
  tag?: keyof JSX.IntrinsicElements
  placeholder?: string
}

export function EditableText({ 
  value, 
  onChange, 
  className = '', 
  tag: Tag = 'div',
  placeholder = 'Click to edit...'
}: EditableTextProps) {
  if (onChange) {
    // Editable version for user-dashboard
    return (
      <Tag 
        className={`editable-text ${className}`}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onChange(e.currentTarget.textContent || '')}
        dangerouslySetInnerHTML={{ __html: value || placeholder }}
      />
    )
  }
  
  // Static version for landing-page
  return <Tag className={className}>{value}</Tag>
}

interface EditableImageProps {
  src?: string
  alt: string
  className?: string
  onImageChange?: (file: File) => void
  placeholder?: string
}

export function EditableImage({ 
  src, 
  alt, 
  className = '', 
  onImageChange,
  placeholder = 'Click to upload image'
}: EditableImageProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImageChange) {
      onImageChange(file)
    }
  }
  
  if (onImageChange) {
    // Editable version for user-dashboard
    return (
      <div className={`editable-image-container ${className}`}>
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            {placeholder}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    )
  }
  
  // Static version for landing-page
  return src ? (
    <img src={src} alt={alt} className={className} />
  ) : null
}

interface OrnamentProps {
  type: 'corner' | 'divider' | 'border' | 'background'
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  src: string
  className?: string
}

export function Ornament({ type, position = 'center', src, className = '' }: OrnamentProps) {
  const baseClasses = 'ornament-element pointer-events-none'
  const typeClasses = {
    corner: 'absolute w-16 h-16 md:w-24 md:h-24',
    divider: 'w-full h-4 my-6',
    border: 'absolute inset-0',
    background: 'absolute inset-0 -z-10'
  }
  
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180',
    'center': 'mx-auto'
  }
  
  const combinedClasses = [
    baseClasses,
    typeClasses[type],
    type === 'corner' ? positionClasses[position] : positionClasses['center'],
    className
  ].join(' ')
  
  return <img src={src} alt="" className={combinedClasses} />
}
