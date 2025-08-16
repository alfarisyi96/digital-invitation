import Link from 'next/link'

export function Navbar() {
  return (
    <header className="w-full sticky top-0 z-20 backdrop-blur bg-white/60 border-b border-neutral-200">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded-full bg-senja-500" />
          <span className="font-semibold tracking-tight">Senja Cerita</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-700">
          <a href="#features" className="hover:text-senja-600">Features</a>
          <a href="#templates" className="hover:text-senja-600">Templates</a>
          <a href="#how-it-works" className="hover:text-senja-600">How it works</a>
          <a href="#pricing" className="hover:text-senja-600">Pricing</a>
          <a href="#faq" className="hover:text-senja-600">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="https://invite.yourdomain.com" className="text-sm text-neutral-700 hover:text-senja-600">View Invitations</a>
          <a href="https://app.yourdomain.com/login" className="text-sm bg-senja-600 hover:bg-senja-700 text-white px-3 py-1.5 rounded-md">Sign In</a>
        </div>
      </div>
    </header>
  )
}
