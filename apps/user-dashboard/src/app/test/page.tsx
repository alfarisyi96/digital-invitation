'use client'

import { useUser } from '@/contexts/UserContext'

export default function AuthTestPage() {
  const { user, isAuthenticated, isLoading, login, logout } = useUser()

  const testLogin = async () => {
    try {
      const result = await login('test-token')
      console.log('Test login result:', result)
    } catch (error) {
      console.error('Test login error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Authentication Status</h3>
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <h3 className="font-semibold mb-2">Environment Variables</h3>
              <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
              <p><strong>Google Client ID:</strong> {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Set (hidden)' : 'Not set'}</p>
            </div>

            <div className="space-x-4">
              <button
                onClick={testLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Login
              </button>
              
              <button
                onClick={() => logout()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">Quick Links</h3>
              <div className="space-y-2">
                <a href="/login" className="block text-blue-600 hover:underline">→ Login Page</a>
                <a href="/dashboard" className="block text-blue-600 hover:underline">→ Dashboard (Protected)</a>
                <a href="/" className="block text-blue-600 hover:underline">→ Home Page</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
