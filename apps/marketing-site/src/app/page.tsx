export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-senja-gradient opacity-20 pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-neutral-900">
              Tell Your Story in Sunset Hues
            </h1>
            <p className="mt-6 text-lg text-neutral-700">
              Senja Cerita helps you craft beautiful digital invitations with elegant templates, RSVP, comments, and galleries—designed for moments worth remembering.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href="#pricing" className="inline-flex items-center justify-center px-5 py-3 rounded-md text-white bg-senja-600 hover:bg-senja-700">
                Get Started
              </a>
              <a href="https://invite.yourdomain.com" className="inline-flex items-center justify-center px-5 py-3 rounded-md border border-neutral-300 text-neutral-800 hover:border-neutral-400">
                View Live Invitations
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-neutral-900 mb-8">Everything you need for a memorable invite</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Elegant Templates', desc: 'Modern, classic, and floral designs with sunset-inspired palettes.' },
            { title: 'RSVP & Guestbook', desc: 'Collect responses and well-wishes from your guests with ease.' },
            { title: 'Gallery & Media', desc: 'Showcase your story with hero images, galleries, and more.' }
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-neutral-200 bg-white shadow-sm">
              <div className="h-10 w-10 rounded-full bg-dusk-200 mb-4" />
              <h3 className="text-lg font-semibold text-neutral-900">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates showcase */}
      <section id="templates" className="bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Crafted designs for every style</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['Classic', 'Modern', 'Floral'].map((name) => (
              <div key={name} className="rounded-xl overflow-hidden border border-neutral-200 bg-white">
                <div className="h-40 bg-gradient-to-br from-senja-100 via-senja-200 to-dusk-200" />
                <div className="p-4">
                  <h3 className="font-semibold">{name}</h3>
                  <p className="text-sm text-neutral-600 mt-1">Sunset-inspired palettes with beautiful typography.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-neutral-900 mb-8">How it works</h2>
        <ol className="grid md:grid-cols-3 gap-6 list-decimal pl-5">
          {[
            { title: 'Pick a template', desc: 'Choose from curated themes and customize colors.' },
            { title: 'Add your story', desc: 'Add details, gallery, and personalize your content.' },
            { title: 'Share and celebrate', desc: 'Send the link, track RSVPs, and collect messages.' }
          ].map((s, i) => (
            <li key={i} className="p-6 rounded-xl border border-neutral-200 bg-white">
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-neutral-600 mt-2">{s.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Testimonials */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Loved by couples</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map((n) => (
              <blockquote key={n} className="p-6 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-700">
                “We loved how easy it was to set up and how beautiful the templates are.”
                <footer className="mt-3 text-neutral-500">— A happy couple</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold text-neutral-900 mb-8">Simple pricing</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[{
            name: 'Basic', price: 'Free', features: ['Core templates', 'Basic customization', 'Share link'], cta: 'Start for Free', popular: false
          }, {
            name: 'Gold', price: '$9 / invite', features: ['Premium templates', 'Gallery & Love Story', 'RSVP & Comments'], cta: 'Upgrade to Gold', popular: true
          }].map((p) => (
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
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">Frequently asked questions</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-neutral-700">
            {[
              { q: 'Can I use my own photos?', a: 'Yes, upload hero and gallery images directly.' },
              { q: 'Is there a free plan?', a: 'Yes, Basic is free with core templates.' },
              { q: 'Can guests RSVP online?', a: 'Yes, RSVP is included in Gold with guest messages.' },
              { q: 'Can I edit after publishing?', a: 'Absolutely. You can update details anytime.' }
            ].map((f) => (
              <div key={f.q} className="p-6 rounded-xl border border-neutral-200 bg-white">
                <h3 className="font-semibold">{f.q}</h3>
                <p className="mt-2 text-neutral-600">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
