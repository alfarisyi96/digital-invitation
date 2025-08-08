'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useInvitations } from '@/hooks/useInvitations'
import { formatDate, getInitials, pluralize } from '@/lib/utils'
import { 
  Plus, 
  Heart, 
  Calendar, 
  Users, 
  Eye, 
  Share2, 
  MoreVertical,
  Search,
  Filter,
  Bell,
  Settings,
  Gift,
  Cake,
  GraduationCap,
  Baby,
  Briefcase,
  Star
} from 'lucide-react'
import { InvitationType, InvitationStatus } from '@/types'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { invitations, isLoading } = useInvitations()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | InvitationStatus>('all')
  const router = useRouter()

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = invitation.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = selectedFilter === 'all' || invitation.status === selectedFilter
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: invitations.length,
    published: invitations.filter(inv => inv.status === InvitationStatus.PUBLISHED).length,
    draft: invitations.filter(inv => inv.status === InvitationStatus.DRAFT).length,
    views: invitations.reduce((sum, inv) => sum + (inv.analytics?.views || 0), 0)
  }

  const getTypeIcon = (type: InvitationType) => {
    switch (type) {
      case InvitationType.WEDDING:
        return <Heart className="w-4 h-4" />
      case InvitationType.BIRTHDAY:
        return <Cake className="w-4 h-4" />
      case InvitationType.GRADUATION:
        return <GraduationCap className="w-4 h-4" />
      case InvitationType.BABY_SHOWER:
        return <Baby className="w-4 h-4" />
      case InvitationType.BUSINESS:
        return <Briefcase className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: InvitationStatus) => {
    switch (status) {
      case InvitationStatus.PUBLISHED:
        return 'bg-green-100 text-green-800'
      case InvitationStatus.DRAFT:
        return 'bg-yellow-100 text-yellow-800'
      case InvitationStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-medium text-sm">{getInitials(user.name)}</span>
                )}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Hello, {user.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-sm text-gray-500">Let's create something beautiful</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => router.push('/settings')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total Invites</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <div className="text-sm text-gray-500">Published</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
              <div className="text-sm text-gray-500">Drafts</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.views}</div>
              <div className="text-sm text-gray-500">Total Views</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={() => router.push('/create')}
              className="h-16 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 flex-col space-y-1"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm">New Invitation</span>
            </Button>
            <Button 
              variant="outline"
              className="h-16 flex-col space-y-1 border-gray-200"
            >
              <Gift className="w-6 h-6 text-gray-600" />
              <span className="text-sm text-gray-600">Browse Templates</span>
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search invitations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {['all', 'draft', 'published', 'archived'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === filter
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Invitations List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Invitations ({filteredInvitations.length})
            </h2>
            <Filter className="w-5 h-5 text-gray-400" />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredInvitations.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || selectedFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start by creating your first invitation'
                  }
                </p>
                <Button 
                  onClick={() => router.push('/create')}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invitation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInvitations.map((invitation) => (
                <Card key={invitation.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="text-gray-600">
                            {getTypeIcon(invitation.type)}
                          </div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {invitation.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}>
                            {invitation.status}
                          </span>
                          <span>{formatDate(invitation.createdAt)}</span>
                        </div>

                        {invitation.analytics && (
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              <span>{invitation.analytics.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>{invitation.analytics.rsvpResponses}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-3 h-3" />
                              <span>{invitation.analytics.shareCount}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
        <div className="grid grid-cols-5 h-16">
          <button className="flex flex-col items-center justify-center space-y-1 text-rose-500">
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Dashboard</span>
          </button>
          <button 
            onClick={() => router.push('/create')}
            className="flex flex-col items-center justify-center space-y-1 text-gray-400"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Create</span>
          </button>
          <button className="flex flex-col items-center justify-center space-y-1 text-gray-400">
            <Gift className="w-5 h-5" />
            <span className="text-xs">Templates</span>
          </button>
          <button className="flex flex-col items-center justify-center space-y-1 text-gray-400">
            <Star className="w-5 h-5" />
            <span className="text-xs">Favorites</span>
          </button>
          <button 
            onClick={logout}
            className="flex flex-col items-center justify-center space-y-1 text-gray-400"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
