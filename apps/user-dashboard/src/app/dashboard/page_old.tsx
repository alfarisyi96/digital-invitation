'use client'

import { withAuth } from '@/contexts/SupabaseUserContext'
import { DashboardContainer } from '@/containers/DashboardContainer'

function DashboardPage() {
  return <DashboardContainer />
}

export default withAuth(DashboardPage)
  const { user } = useUser()
  const router = useRouter()
  const { 
    invitations, 
    loading: invitationsLoading, 
    publishInvitation,
    unpublishInvitation 
  } = useUserInvitations()
  const { profile, loading: profileLoading } = useUserProfile()
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Filter invitations based on search query (client-side filtering of RLS-filtered data)
  const filteredInvitations = invitations.filter(invitation =>
    invitation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (invitation.description?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCreateInvitation = () => {
    router.push('/create?step=1')
  }

  const handlePublishInvitation = async (id: string) => {
    setActionLoading(id)
    try {
      await publishInvitation(id)
    } catch (error) {
      console.error('Error publishing invitation:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnpublishInvitation = async (id: string) => {
    setActionLoading(id)
    try {
      await unpublishInvitation(id)
    } catch (error) {
      console.error('Error unpublishing invitation:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const openInvitationPreview = (slugOrId: string) => {
    if (slugOrId) {
      // For private preview in user dashboard - use a preview route that doesn't require public publishing
      // This route would be handled within the user dashboard app for private previews
      window.open(`/preview/${slugOrId}`, '_blank')
    }
  }

  const handleEditInvitation = (id: string) => {
    router.push(`/create?step=1&edit=${id}`)
  }

  const getStatusBadge = (status: string, isPublished: boolean) => {
    if (status === 'published' && isPublished) {
      return 'bg-green-100 text-green-800'
    } else if (status === 'unpublished' || !isPublished) {
      return 'bg-red-100 text-red-800'
    } else {
      return 'bg-gray-100 text-gray-800'
    }
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
                  {invitations.filter(inv => inv.status === 'published' && inv.is_published).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Ready to share
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invitations.reduce((total, inv) => total + (inv.unique_visitors || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Unique visitors
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
                    <Card key={invitation.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 break-words hyphens-auto leading-tight">
                              {invitation.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(invitation.status, invitation.is_published)}`}>
                                {invitation.is_published ? 'Published' : 'Draft'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                          {invitation.description || 'No description provided'}
                        </p>
                        
                        {/* Event Details */}
                        <div className="space-y-2 mb-4">
                          {invitation.event_date && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                              {new Date(invitation.event_date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          )}
                          
                          {invitation.location && (
                            <div className="flex items-center text-sm text-gray-500">
                              <span className="w-4 h-4 mr-2 text-center">📍</span>
                              <span className="truncate">{invitation.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Analytics */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4 p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {invitation.views_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {invitation.unique_visitors}
                            </span>
                          </div>
                          <span className="text-xs">
                            {new Date(invitation.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {/* Publish Toggle */}
                        <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-600" />
                            <div>
                              <span className="text-sm font-medium text-blue-900 block">
                                {invitation.is_published ? 'Published' : 'Publish'}
                              </span>
                              <span className="text-xs text-blue-700">
                                {invitation.is_published ? 'Publicly accessible' : 'Make publicly accessible'}
                              </span>
                            </div>
                          </div>
                          <Switch
                            checked={invitation.is_published}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handlePublishInvitation(invitation.id)
                              } else {
                                handleUnpublishInvitation(invitation.id)
                              }
                            }}
                            disabled={actionLoading === invitation.id}
                          />
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditInvitation(invitation.id)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          
                          {/* Preview button - always available for private preview */}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openInvitationPreview(invitation.public_slug || invitation.id)}
                            className="flex-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                            disabled={!invitation.public_slug && !invitation.id}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            {invitation.is_published ? 'Preview' : 'Preview Draft'}
                          </Button>
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
