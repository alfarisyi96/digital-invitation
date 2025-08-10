import { useState } from 'react'
import { WeddingFormData } from '@/services/supabaseService'

export function useFormData() {
  const [formData, setFormData] = useState<WeddingFormData | null>(null)

  const updateFormData = (data: WeddingFormData) => {
    setFormData(data)
  }

  const clearFormData = () => {
    setFormData(null)
  }

  return {
    formData,
    updateFormData,
    clearFormData
  }
}
