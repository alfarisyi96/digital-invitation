import { 
  Heart, 
  Cake, 
  GraduationCap, 
  Baby, 
  Briefcase 
} from 'lucide-react'
import { InvitationType } from '@/services/supabaseService'

export const INVITATION_CATEGORIES = [
  {
    id: 'wedding' as InvitationType,
    name: 'Wedding',
    icon: Heart,
    description: 'Wedding invitations and ceremonies',
    color: 'bg-rose-50 text-rose-600 border-rose-200'
  },
  {
    id: 'birthday' as InvitationType,
    name: 'Birthday',
    icon: Cake,
    description: 'Birthday party invitations',
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200'
  },
  {
    id: 'graduation' as InvitationType,
    name: 'Graduation',
    icon: GraduationCap,
    description: 'Graduation ceremony invitations',
    color: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    id: 'baby_shower' as InvitationType,
    name: 'Baby Shower',
    icon: Baby,
    description: 'Baby shower invitations',
    color: 'bg-pink-50 text-pink-600 border-pink-200'
  },
  {
    id: 'business' as InvitationType,
    name: 'Business',
    icon: Briefcase,
    description: 'Corporate and business events',
    color: 'bg-gray-50 text-gray-600 border-gray-200'
  }
] as const

export const STEP_LABELS = ['Category', 'Details', 'Templates', 'Preview'] as const

export const GOLD_PACKAGE_FEATURES = [
  'Premium template designs',
  'Advanced customization options',
  'Priority support',
  'No watermarks',
  'Analytics dashboard'
] as const

export const GOLD_PACKAGE_PRICE = '$9.99'
