export default function PricingPage() {
  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      features: ['Core templates', 'Basic customization', 'Share link'],
      cta: 'Start for Free',
      popular: false
    },
    {
      name: 'Gold',
      price: '$9 / invite',
      features: ['Premium templates', 'Gallery & Love Story', 'RSVP & Comments'],
      cta: 'Upgrade to Gold',
      popular: true
    }
  ]

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-bold text-center mb-4">Pricing</h1>
      <p className="text-center text-neutral-600 mb-12">Simple pricing for beautiful invitations.</p>
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((p) => (
          <div key={p.name} className={`rounded-2xl border ${p.popular ? 'border-senja-300 shadow-lg' : 'border-neutral-200'} p-6 bg-white`}>
            {p.popular && (
              <div className="inline-block text-xs font-medium bg-senja-100 text-senja-700 px-2 py-1 rounded mb-2">Most Popular</div>
            )}
            <h3 className="text-xl font-semibold">{p.name}</h3>
            <p className="text-3xl font-extrabold mt-2">{p.price}</p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-700">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="inline-block h-1.5 w-1.5 rounded-full bg-senja-500" />{f}</li>
              ))}
            </ul>
            <div className="mt-6">
              <a href="https://app.yourdomain.com/signup" className={`inline-flex items-center justify-center px-5 py-3 rounded-md ${p.popular ? 'bg-senja-600 text-white hover:bg-senja-700' : 'border border-neutral-300 text-neutral-800 hover:border-neutral-400'}`}>
                {p.cta}
              </a>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
