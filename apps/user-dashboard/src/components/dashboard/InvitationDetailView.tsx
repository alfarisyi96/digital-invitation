'use client'

import React, { useState } from 'react'
import { useComments, useRSVPResponses } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye, 
  Edit, 
  Share, 
  Users, 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  ExternalLink,
  Copy,
  BarChart3,
  Calendar,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { toast } from '@/hooks/use-toast'

interface InvitationDetailViewProps {
  invitation: any
  rsvpSummary: any
  rsvpResponses: any[]
  comments: any[]
}

export default function InvitationDetailView({ 
  invitation, 
  rsvpSummary, 
  rsvpResponses: initialRsvpResponses, 
  comments: initialComments 
}: InvitationDetailViewProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  
  // Use hooks for real-time data and better state management
  const { 
    comments, 
    loading: commentsLoading, 
    moderateComment,
    refetch: refetchComments 
  } = useComments(invitation.id, true) // Include unapproved for admin view
  
  const { 
    responses: rsvpResponses, 
    loading: rsvpLoading,
    refetch: refetchRsvp 
  } = useRSVPResponses(invitation.id)

  // Use initial data if hooks haven't loaded yet, then switch to real-time data
  const displayComments = comments.length > 0 ? comments : initialComments
  const displayRsvpResponses = rsvpResponses.length > 0 ? rsvpResponses : initialRsvpResponses

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'archived': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAttendanceColor = (status: string) => {
    switch (status) {
      case 'attending': return 'bg-green-100 text-green-800'
      case 'not_attending': return 'bg-red-100 text-red-800'
      case 'maybe': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const copyInvitationLink = () => {
    const publicUrl = `${window.location.origin}/i/${invitation.public_slug}`
    navigator.clipboard.writeText(publicUrl)
    toast({
      title: "Link copied!",
      description: "Invitation link has been copied to clipboard.",
    })
  }

  const handleCommentApproval = async (commentId: string, isApproved: boolean) => {
    setIsUpdating(true)
    try {
      const action = isApproved ? 'approve' : 'reject'
      const success = await moderateComment(commentId, action)

      if (success) {
        toast({
          title: isApproved ? "Comment approved" : "Comment rejected",
          description: `Comment has been ${isApproved ? 'approved' : 'rejected'}.`,
        })
        // The hook will automatically refresh the data
      } else {
        throw new Error('Failed to moderate comment')
      }
    } catch (error) {
      console.error('Error updating comment:', error)
      toast({
        title: "Error",
        description: "Failed to update comment status.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{invitation.title}</h1>
          <p className="text-gray-600 mt-1">
            Created on {formatDate(invitation.created_at)}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(invitation.status)}>
            {invitation.status}
          </Badge>
          
          {invitation.status === 'published' && (
            <Button
              onClick={copyInvitationLink}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </Button>
          )}
          
          <Link href={`/create?edit=${invitation.id}&category=${invitation.category}`}>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </Link>
          
          {invitation.status === 'published' && (
            <Link href={`/i/${invitation.public_slug}`} target="_blank">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View Public
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total RSVPs</p>
              <p className="text-2xl font-bold">{rsvpSummary?.total_responses || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Attending</p>
              <p className="text-2xl font-bold">{rsvpSummary?.attending || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <MessageCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Comments</p>
              <p className="text-2xl font-bold">
                {commentsLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  displayComments.length
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Eye className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Template</p>
              <p className="text-lg font-bold">{invitation.templates?.name}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rsvp" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rsvp">RSVP Management</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* RSVP Management */}
        <TabsContent value="rsvp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                RSVP Responses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rsvpLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
                  <p className="text-gray-500">Loading RSVP responses...</p>
                </div>
              ) : displayRsvpResponses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No RSVP responses yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayRsvpResponses.map((response) => (
                    <div key={response.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{response.guest_name}</h4>
                          <Badge className={getAttendanceColor(response.attendance_status)}>
                            {response.attendance_status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {formatDate(response.created_at)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {response.guest_email && (
                          <div>
                            <span className="font-medium">Email:</span><br />
                            {response.guest_email}
                          </div>
                        )}
                        {response.guest_phone && (
                          <div>
                            <span className="font-medium">Phone:</span><br />
                            {response.guest_phone}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Guests:</span><br />
                          {response.number_of_guests}
                        </div>
                        {response.dietary_restrictions && (
                          <div>
                            <span className="font-medium">Dietary:</span><br />
                            {response.dietary_restrictions}
                          </div>
                        )}
                      </div>
                      
                      {response.message && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <span className="font-medium">Message:</span><br />
                          {response.message}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comments Management */}
        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Comments & Guest Book
              </CardTitle>
            </CardHeader>
            <CardContent>
              {commentsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
                  <p className="text-gray-500">Loading comments...</p>
                </div>
              ) : displayComments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No comments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayComments.map((comment) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h4 className="font-medium">{comment.author_name}</h4>
                          <Badge className={comment.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {comment.is_approved ? 'Approved' : 'Pending'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{comment.comment_text}</p>
                      
                      {!comment.is_approved && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleCommentApproval(comment.id, true)}
                            disabled={isUpdating}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCommentApproval(comment.id, false)}
                            disabled={isUpdating}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">RSVP Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Responses:</span>
                      <span className="font-medium">{rsvpSummary?.total_responses || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attending:</span>
                      <span className="font-medium text-green-600">{rsvpSummary?.attending || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Not Attending:</span>
                      <span className="font-medium text-red-600">{rsvpSummary?.not_attending || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Maybe:</span>
                      <span className="font-medium text-yellow-600">{rsvpSummary?.maybe || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Guests:</span>
                      <span className="font-medium">{rsvpSummary?.total_guests || 0}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Engagement</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Comments:</span>
                      <span className="font-medium">{displayComments.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Approved Comments:</span>
                      <span className="font-medium text-green-600">
                        {displayComments.filter(c => c.is_approved).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending Comments:</span>
                      <span className="font-medium text-yellow-600">
                        {displayComments.filter(c => !c.is_approved).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
