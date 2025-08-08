import { useState, useEffect } from 'react'

export interface WeddingDetails {
  id: string
  groomName: string
  brideName: string
  groomParents: string[]
  brideParents: string[]
  date: string
  time: string
  venueName: string
  venueAddress: string
  story: string
  message: string
  hashtag: string
  dresscode: string
  heroImage: File | null
  gallery: File[]
  backgroundMusic: {
    enabled: boolean
    url: string
    title: string
    artist: string
    autoplay: boolean
    volume: number
  }
  timeline: Array<{
    time: string
    title: string
    description: string
    location: string
  }>
  rsvpEnabled: boolean
  giftRegistryEnabled: boolean
  bankAccount: {
    bankName: string
    accountNumber: string
    accountName: string
  }
}

export function useWeddingDetails(invitationId: string) {
  const [details, setDetails] = useState<WeddingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true)
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/invitations/${invitationId}`)
        // const data = await response.json()
        
        // Mock data for now
        const mockDetails: WeddingDetails = {
          id: invitationId,
          groomName: 'John Alexander',
          brideName: 'Sarah Michelle',
          groomParents: ['Mr. David Alexander', 'Mrs. Linda Alexander'],
          brideParents: ['Mr. Robert Michelle', 'Mrs. Maria Michelle'],
          date: '2025-08-15',
          time: '16:00',
          venueName: 'Grand Ballroom Hotel Mulia',
          venueAddress: 'Jl. Asia Afrika No. 1, Senayan, Jakarta Selatan 10270',
          story: 'We met during our college years at University of Indonesia. What started as a friendship in the library gradually blossomed into a beautiful love story. After 5 years together, John proposed during our trip to Bali, and now we\'re ready to start our forever journey together.',
          message: 'Your presence at our wedding would mean the world to us. Join us as we celebrate love, family, and the beginning of our new chapter together. We can\'t wait to share this special day with you!',
          hashtag: '#SarahJohnWedding2025',
          dresscode: 'Formal Attire - Earth Tones Preferred',
          heroImage: null,
          gallery: [],
          backgroundMusic: {
            enabled: true,
            url: '',
            title: 'Perfect',
            artist: 'Ed Sheeran',
            autoplay: false,
            volume: 50
          },
          timeline: [
            {
              time: '16:00',
              title: 'Holy Ceremony',
              description: 'Wedding ceremony with family and friends',
              location: 'Main Chapel'
            },
            {
              time: '17:00',
              title: 'Photo Session',
              description: 'Family and couple photography',
              location: 'Garden Area'
            },
            {
              time: '18:00',
              title: 'Cocktail Reception',
              description: 'Welcome drinks and light appetizers',
              location: 'Lobby Lounge'
            },
            {
              time: '19:00',
              title: 'Wedding Reception',
              description: 'Dinner, speeches, and celebration',
              location: 'Grand Ballroom'
            },
            {
              time: '22:00',
              title: 'After Party',
              description: 'Dancing and celebration continues',
              location: 'Rooftop Terrace'
            }
          ],
          rsvpEnabled: true,
          giftRegistryEnabled: true,
          bankAccount: {
            bankName: 'Bank Central Asia (BCA)',
            accountNumber: '1234567890',
            accountName: 'Sarah Michelle & John Alexander'
          }
        }
        
        setDetails(mockDetails)
      } catch (err) {
        setError('Failed to load wedding details')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (invitationId) {
      fetchDetails()
    }
  }, [invitationId])

  return { details, isLoading, error }
}
