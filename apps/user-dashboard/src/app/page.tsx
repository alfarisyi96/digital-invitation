export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Welcome to Your Dashboard
        </h1>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Create Your Perfect Invitation
            </h2>
            <p className="text-gray-600 mb-6">
              Design beautiful invitations for weddings, parties, and special events with our easy-to-use builder.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 text-xl">✨</span>
                </div>
                <h3 className="font-semibold mb-2">Choose Template</h3>
                <p className="text-sm text-gray-600">Select from our collection of beautiful templates</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 text-xl">✏️</span>
                </div>
                <h3 className="font-semibold mb-2">Customize</h3>
                <p className="text-sm text-gray-600">Personalize with your text, images, and colors</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 text-xl">📤</span>
                </div>
                <h3 className="font-semibold mb-2">Share</h3>
                <p className="text-sm text-gray-600">Send your invitations digitally or print them</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Start Creating
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Recent Invitations</h3>
            <div className="text-gray-500 text-center py-8">
              <p>No invitations yet. Create your first invitation to get started!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
