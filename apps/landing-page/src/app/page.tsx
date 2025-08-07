import Link from 'next/link'
import { ArrowRight, Check, Star, Users, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">InviteMe</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#templates" className="text-gray-600 hover:text-gray-900">Templates</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Link 
                href="http://localhost:3001" 
                className="text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link 
                href="http://localhost:3001" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Beautiful Digital
            <span className="text-blue-600"> Invitations</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Create stunning digital invitations for weddings, parties, and special events. 
            Choose from beautiful templates, customize easily, and send instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="http://localhost:3001"
              className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
            >
              Start Creating <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-50 transition-colors">
              View Templates
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to create perfect invitations
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides all the tools you need to design, customize, and send beautiful invitations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Zap className="h-12 w-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Easy to Use</h4>
              <p className="text-gray-600">
                Create beautiful invitations in minutes with our intuitive drag-and-drop editor.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Star className="h-12 w-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Beautiful Templates</h4>
              <p className="text-gray-600">
                Choose from hundreds of professionally designed templates for every occasion.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h4 className="text-xl font-semibold mb-2">Instant Delivery</h4>
              <p className="text-gray-600">
                Send your invitations via email, SMS, or social media with just one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h3>
            <p className="text-lg text-gray-600">
              Choose the plan that works best for you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-xl font-semibold mb-2">Free</h4>
              <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal">/month</span></p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> 3 invitations per month</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Basic templates</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Email delivery</li>
              </ul>
              <Link 
                href="http://localhost:3001"
                className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-center block"
              >
                Get Started
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-blue-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-semibold">Pro</h4>
                <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-xs">Popular</span>
              </div>
              <p className="text-3xl font-bold mb-4">$9.99<span className="text-sm font-normal">/month</span></p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Unlimited invitations</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Premium templates</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Multiple delivery options</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Custom branding</li>
              </ul>
              <Link 
                href="http://localhost:3001"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
              >
                Get Started
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="text-xl font-semibold mb-2">Business</h4>
              <p className="text-3xl font-bold mb-4">$29.99<span className="text-sm font-normal">/month</span></p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Everything in Pro</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Team collaboration</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Analytics & tracking</li>
                <li className="flex items-center"><Check className="h-4 w-4 text-green-500 mr-2" /> Priority support</li>
              </ul>
              <Link 
                href="http://localhost:3001"
                className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors text-center block"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-lg font-semibold mb-4">InviteMe</h5>
              <p className="text-gray-400">
                Create beautiful digital invitations for your special moments.
              </p>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Product</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Templates</a></li>
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Support</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-4">Company</h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 InviteMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
