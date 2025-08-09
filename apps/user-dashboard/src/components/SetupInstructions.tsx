'use client'

export default function SetupInstructions() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-blue-50 border border-blue-200 rounded-lg mb-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">🔧 Supabase Setup Required</h3>
      <div className="space-y-3 text-sm text-blue-800">
        <p>To enable Google Login with Supabase, you need to:</p>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Make sure your local Supabase is running: <code className="bg-blue-100 px-1 rounded">npm run supabase:start</code></li>
          <li>Go to your Supabase Dashboard → Authentication → Providers</li>
          <li>Enable Google provider and configure OAuth settings</li>
          <li>Or use the local Supabase instance (recommended for development)</li>
        </ol>
        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="font-medium">Update this file:</p>
          <code className="text-xs block mt-1">inv-fe/apps/user-dashboard/.env.local</code>
          <pre className="text-xs mt-2 p-2 bg-white rounded border">
{`# For local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase

# Or for hosted Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_hosted_anon_key`}
          </pre>
        </div>
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
          <p className="font-medium text-green-800">✨ No Google Console setup needed!</p>
          <p className="text-green-700 text-xs mt-1">Supabase handles all OAuth configuration for you.</p>
        </div>
      </div>
    </div>
  )
}
