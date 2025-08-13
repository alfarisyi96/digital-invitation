'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import InvitationDetailView from '@/components/dashboard/InvitationDetailView'
import { supabaseService } from '@/services/supabaseService'
import { Loader2 } from 'lucide-react'

interface InvitationData {
  invitation: any
  rsvpSummary: any
  rsvpResponses: any[]
  comments: any[]
}

export default function InvitationDetailPage() {
  const params = useParams()
  const [data, setData] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInvitationData() {
      try {
        const invitationData = await supabaseService.getInvitationDetails(params.id as string)
        
        if (!invitationData) {
          notFound()
          return
        }

        setData(invitationData)
      } catch (err) {
        console.error('Error fetching invitation:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchInvitationData()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InvitationDetailView 
        invitation={data.invitation}
        rsvpSummary={data.rsvpSummary}
        rsvpResponses={data.rsvpResponses}
        comments={data.comments}
      />
    </div>
  )
}
