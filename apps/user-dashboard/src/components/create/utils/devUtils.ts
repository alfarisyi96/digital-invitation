import { WeddingFormData } from '@/services/supabaseService'

export const SAMPLE_WEDDING_DATA: WeddingFormData = {
  bride_full_name: 'Sarah Elizabeth Johnson',
  bride_nickname: 'Sarah',
  groom_full_name: 'John Michael Smith',
  groom_nickname: 'John',
  wedding_date: '2025-12-15',
  ceremony_time: '14:00',
  reception_time: '18:00',
  venue_name: 'Grand Ballroom Hotel',
  venue_address: '123 Elegant Street, Wedding City, WC 12345',
  invitation_message: 'We joyfully invite you to celebrate our special day with us. Your presence would make our wedding complete!',
  bride_father: 'Mr. Robert Johnson',
  bride_mother: 'Mrs. Mary Johnson',
  groom_father: 'Mr. David Smith',
  groom_mother: 'Mrs. Lisa Smith',
}

export const isDevelopment = process.env.NODE_ENV === 'development'
