import './globals.css'
import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Digital Invitations – Beautiful, Fast, and Easy',
  description: 'Create stunning digital invitations with RSVP, comments, gallery, and more.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
  <html lang="en" className="scroll-smooth">
      <body className="antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
