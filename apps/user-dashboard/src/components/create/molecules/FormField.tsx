import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormFieldProps {
  id: string
  label: string
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'time'
  required?: boolean
  form: UseFormReturn<any>
  className?: string
}

export function FormField({ 
  id, 
  label, 
  placeholder, 
  type = 'text', 
  required = false, 
  form,
  className = ''
}: FormFieldProps) {
  const error = form.formState.errors[id]
  
  return (
    <div className={className}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input 
        id={id}
        type={type}
        placeholder={placeholder}
        {...form.register(id)}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">
          {error.message as string}
        </p>
      )}
    </div>
  )
}
