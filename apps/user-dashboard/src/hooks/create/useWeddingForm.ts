import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Form validation schema
const weddingFormSchema = z.object({
  title: z.string(),
  bride_full_name: z.string(),
  bride_nickname: z.string().optional(),
  groom_full_name: z.string(),
  groom_nickname: z.string().optional(),
  wedding_date: z.string(),
  ceremony_time: z.string().optional(),
  reception_time: z.string().optional(),
  venue_name: z.string(),
  venue_address: z.string().optional(),
  invitation_message: z.string().optional(),
  bride_father: z.string().optional(),
  bride_mother: z.string().optional(),
  groom_father: z.string().optional(),
  groom_mother: z.string().optional(),
})

export type WeddingFormValues = z.infer<typeof weddingFormSchema>

export function useWeddingForm() {
  const form = useForm<WeddingFormValues>({
    resolver: zodResolver(weddingFormSchema),
    defaultValues: {
      title: '',
      bride_full_name: '',
      bride_nickname: '',
      groom_full_name: '',
      groom_nickname: '',
      wedding_date: '',
      ceremony_time: '',
      reception_time: '',
      venue_name: '',
      venue_address: '',
      invitation_message: '',
      bride_father: '',
      bride_mother: '',
      groom_father: '',
      groom_mother: '',
    }
  })

  return form
}
