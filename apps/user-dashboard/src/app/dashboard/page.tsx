'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser, withAuth } from '@/contexts/SupabaseUserContext'
import { useUserInvitations, useUserProfile } from '@/hooks/useSupabaseData'
import Header from '@/components/Header'
import { 
  Plus, 
  Calendar, 
  Eye, 
  Share2, 
  Search,
  Gift,
  Shield
} from 'lucide-react'

function DashboardPage() {
  const { user } = useUser()
  const { invitations, loading: invitationsLoading, createInvitation } = useUserInvitations()
  const { profile, loading: profileLoading } = useUserProfile()
  const [searchQuery, setSearchQuery] = useState('')

  // Filter invitations based on search query (client-side filtering of RLS-filtered data)
  const filteredInvitations = invitations.filter(invitation =>
    invitation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invitation.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreateInvitation = async () => {
    const newInvitation = {
      title: 'New Invitation',
      description: 'Click to edit this invitation',
      event_date: null,
      event_location: null,
      template_id: null,
      status: 'draft' as const
    }

    await createInvitation(newInvitation)
  }

  if (profileLoading || invitationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section with RLS Status */}
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back, {user?.name || profile?.full_name || 'User'}! 
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Create beautiful invitations for your special events
              </p>
              
              {/* RLS Security Indicator */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-6">
                <Shield className="w-3 h-3 mr-1" />
                Row Level Security Active - Your data is private and secure
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={handleCreateInvitation}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Invitation
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search your invitations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-4 mb-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{invitations.length}</div>
                <p className="text-xs text-muted-foreground">
                  Only your invitations (RLS protected)
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Draft</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invitations.filter(inv => inv.status === 'draft').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Waiting to be completed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invitations.filter(inv => inv.status === 'published').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ready to share
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sent</CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invitations.filter(inv => inv.status === 'sent').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Delivered to guests
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Invitations List */}
        <div className="px-4">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Your Invitations
                {searchQuery && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (filtered by "{searchQuery}")
                  </span>
                )}
              </h3>
              
              {filteredInvitations.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchQuery ? 'No matching invitations' : 'No invitations yet'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery 
                      ? 'Try adjusting your search terms'
                      : 'Get started by creating your first invitation.'
                    }
                  </p>
                  {!searchQuery && (
                    <div className="mt-6">
                      <Button 
                        onClick={handleCreateInvitation}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Invitation
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredInvitations.map((invitation) => (
                    <Card key={invitation.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium truncate">
                            {invitation.title}
                          </CardTitle>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invitation.status === 'draft' 
                              ? 'bg-gray-100 text-gray-800'
                              : invitation.status === 'published'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {invitation.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {invitation.description || 'No description'}
                        </p>
                        
                        {invitation.event_date && (
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(invitation.event_date).toLocaleDateString()}
                          </div>
                        )}
                        
                        {invitation.event_location && (
                          <div className="text-xs text-gray-500 mb-3 truncate">
                            📍 {invitation.event_location}
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            Created {new Date(invitation.created_at).toLocaleDateString()}
                          </span>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Share2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default withAuth(DashboardPage)
