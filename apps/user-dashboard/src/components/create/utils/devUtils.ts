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
  // Enhanced event details with multiple events and maps
  events: [
    {
      name: 'Akad Nikah',
      date: '2025-12-15',
      time: '14:00',
      venue_name: 'Masjid Al-Ikhlas',
      venue_address: '456 Islamic Center Blvd, Wedding City, WC 12345',
      venue_maps_url: 'https://maps.google.com/?q=Masjid+Al-Ikhlas+Wedding+City',
      dress_code: 'Traditional/Formal',
      notes: 'Please arrive 30 minutes early for the ceremony'
    },
    {
      name: 'Reception',
      date: '2025-12-15',
      time: '18:00',
      venue_name: 'Grand Ballroom Hotel',
      venue_address: '123 Elegant Street, Wedding City, WC 12345',
      venue_maps_url: 'https://maps.google.com/?q=Grand+Ballroom+Hotel+Wedding+City',
      dress_code: 'Formal',
      notes: 'Dinner will be served at 19:00'
    }
  ],
  // Gift account details
  gift_accounts: [
    {
      bank_name: 'Bank Central Asia (BCA)',
      account_number: '1234567890',
      account_name: 'Sarah & John Wedding',
      account_type: 'bank',
      notes: 'For wedding gifts and contributions'
    },
    {
      bank_name: 'GoPay',
      account_number: '081234567890',
      account_name: 'Sarah Johnson',
      account_type: 'ewallet',
      notes: 'Alternative digital payment'
    }
  ]
}

export const isDevelopment = process.env.NODE_ENV === 'development'
