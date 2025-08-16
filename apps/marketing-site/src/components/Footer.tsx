export function Footer() {
  return (
    <footer className="border-t border-neutral-200 mt-16">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-neutral-600 flex flex-col md:flex-row gap-6 md:gap-0 md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-5 w-5 rounded-full bg-dusk-500" />
          <span>© {new Date().getFullYear()} Senja Cerita</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#" className="hover:text-senja-600">Privacy</a>
          <a href="#" className="hover:text-senja-600">Terms</a>
          <a href="#" className="hover:text-senja-600">Contact</a>
        </div>
      </div>
    </footer>
  )
}
