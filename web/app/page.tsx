import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen" style={{ background: '#FAFAF8', color: '#0A0A0A' }}>

      {/* ─── NAV ─── */}
      <nav style={{ borderBottom: '1px solid rgba(10,10,10,0.06)', background: 'rgba(250,250,248,0.95)' }} className="sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-[1360px] mx-auto px-8 flex items-center justify-between h-20">
          <Link href="/" className="flex items-center -my-2">
            <Image src="/logo.png" alt="CAV Farming Technologies" width={132} height={84} className="object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="max-w-[1360px] mx-auto px-8 pt-20 pb-12">
        
        {/* Top label */}
        <div className="flex items-center gap-3 mb-10 fade-in">
          <div className="h-px w-8" style={{ background: '#1A3A2A' }} />
          <span className="label" style={{ color: '#1A3A2A' }}>Vertical Farming · AI-Optimized</span>
        </div>

        {/* Massive heading */}
        <div className="fade-in" style={{animationDelay: '0.05s'}}>
          <h1 className="heading-display leading-[0.95] mb-12"
              style={{ fontWeight: 800, letterSpacing: '-0.04em', fontSize: 'clamp(3.5rem,9vw,9rem)' }}>
            <span style={{ color: '#0A0A0A' }}>Cultivation</span><br/>
            <span style={{ color: '#0A0A0A', WebkitTextStroke: '2px #0A0A0A', WebkitTextFillColor: 'transparent' }}>towards</span><br/>
            <span style={{ color: '#1A3A2A' }}>the peak.</span>
          </h1>
        </div>

        {/* Sub-row: description + CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end fade-in" style={{animationDelay: '0.1s'}}>
          <div>
            <p className="text-xl leading-relaxed max-w-lg" style={{ color: '#5A5A5A', fontWeight: 400 }}>
              AI-orchestrated vertical farming across 10,000 modules. 
              Order precision-grown lettuce and tomatoes, 
              delivered at peak perfection.
            </p>
          </div>
          <div className="flex items-center gap-4 lg:justify-end">
            <Link href="/register" className="btn-green" style={{ padding: '0.875rem 2rem', fontSize: '0.9375rem' }}>
              Begin Cultivation
            </Link>
            <Link href="/login" className="btn-outline" style={{ padding: '0.875rem 2rem', fontSize: '0.9375rem' }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ─── HERO IMAGE — full bleed ─── */}
      <section className="fade-in" style={{animationDelay: '0.15s'}}>
        <div className="max-w-[1360px] mx-auto px-8 mb-4">
          <div className="relative overflow-hidden rounded-2xl" 
               style={{ aspectRatio: '16/7', background: '#0A0A0A' }}>
            <Image 
              src="/hero-bg.png" 
              alt="CAV Vertical Farm Facility" 
              fill
              className="object-cover opacity-80"
              priority
            />
            {/* Overlay grid rule on top of image */}
            <div className="absolute inset-0" 
                 style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(10,10,10,0.4) 100%)' }} />
            
            {/* Bottom-left live chip */}
            <div className="absolute bottom-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full"
                 style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ background: '#4ADE80' }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#4ADE80' }} />
              </span>
              <span className="text-white text-xs font-medium tracking-wide">
                10,000 modules growing live
              </span>
            </div>
            
            {/* Stats overlay bottom-right */}
            <div className="absolute bottom-6 right-6 flex items-center gap-6">
              {[
                { n: '450K', l: 'Plant Spots' },
                { n: '27d', l: 'Min Harvest' },
              ].map(({ n, l }) => (
                <div key={l} className="text-right">
                  <div className="text-white font-bold text-2xl tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>{n}</div>
                  <div className="text-white/50 text-[10px] uppercase tracking-wider font-medium">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE TICKER ─── */}
      <div className="overflow-hidden py-4 mb-0" style={{ borderTop: '1px solid rgba(10,10,10,0.06)', borderBottom: '1px solid rgba(10,10,10,0.06)' }}>
        <div className="marquee-track gap-14 text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: 'rgba(10,10,10,0.3)' }}>
          {['AI-Optimized Growth', 'Precision Lettuce', 'Hydroponic Tomatoes', 'Autonomous Relocation', 'Real-Time Tracking', '27-Day Harvest Cycle',
            'AI-Optimized Growth', 'Precision Lettuce', 'Hydroponic Tomatoes', 'Autonomous Relocation', 'Real-Time Tracking', '27-Day Harvest Cycle'].map((s, i) => (
            <span key={i} className="flex items-center gap-14">
              <span>{s}</span>
              {i < 11 && <span style={{ color: 'rgba(10,10,10,0.12)' }}>—</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <section className="max-w-[1360px] mx-auto px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left label column */}
          <div className="lg:col-span-3 fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-6" style={{ background: '#1A3A2A' }} />
              <span className="label" style={{ color: '#1A3A2A' }}>Process</span>
            </div>
            <h2 className="heading-display text-4xl" style={{ color: '#0A0A0A' }}>
              Seed<br/>to<br/>Plate.
            </h2>
          </div>

          {/* Steps */}
          <div className="lg:col-span-9 stagger">
            {[
              {
                n: '01',
                title: 'Define Your Yield',
                body: 'Specify the exact kilograms of lettuce or tomatoes you need. Our algorithm instantly allocates the optimal grow spots across the facility.',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/></svg>
                ),
              },
              {
                n: '02',
                title: 'AI Cultivates',
                body: 'Robotic arms relocate your plants overnight to highest-yield modules, accelerating growth by up to 30% through precision light and nutrient exposure.',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                ),
              },
              {
                n: '03',
                title: 'Harvest & Deliver',
                body: 'Track your plants in real-time on the facility map. When growth peaks, your produce is harvested at peak nutrition and freshness, then delivered.',
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
                ),
              },
            ].map((step) => (
              <div key={step.n} className="flex gap-8 pb-10" 
                   style={{ borderBottom: '1px solid rgba(10,10,10,0.07)' }}>
                <div className="w-12 shrink-0 pt-1">
                  <span className="label text-lg" style={{ color: 'rgba(10,10,10,0.18)', fontWeight: 700, letterSpacing: '0' }}>{step.n}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                         style={{ background: '#F3F2EE', color: '#1A3A2A' }}>
                      {step.icon}
                    </div>
                    <h3 className="font-semibold text-lg" style={{ color: '#0A0A0A', letterSpacing: '-0.02em' }}>
                      {step.title}
                    </h3>
                  </div>
                  <p className="leading-relaxed" style={{ color: '#5A5A5A', fontSize: '0.9375rem' }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS / FEATURE GRID ─── */}
      <section className="max-w-[1360px] mx-auto px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Big stat */}
          <div className="md:col-span-1 card-flat p-10 flex flex-col justify-between" style={{ minHeight: 280 }}>
            <div className="label" style={{ color: '#1A3A2A' }}>Capacity</div>
            <div>
              <div className="heading-display text-7xl md:text-8xl" style={{ color: '#0A0A0A', fontWeight: 800 }}>
                450<span style={{ color: '#1A3A2A' }}>K</span>
              </div>
              <div className="text-sm mt-2" style={{ color: '#8A8A8A' }}>Active plant spots</div>
            </div>
          </div>

          {/* Map feature card */}
          <div className="md:col-span-2 card-flat relative overflow-hidden p-10 flex flex-col justify-between" style={{ minHeight: 280, background: '#1A3A2A' }}>
            <div className="absolute inset-0 dot-grid opacity-10" />
            <div className="relative">
              <span className="label" style={{ color: 'rgba(255,255,255,0.45)' }}>Interactive</span>
              <h3 className="text-2xl font-bold mt-2 mb-3 text-white" style={{ letterSpacing: '-0.02em' }}>
                Live Facility Map
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9375rem', maxWidth: 380 }}>
                Watch your plants growing across 10,000 modules in real-time. Zoom into any module, track progress, and see exactly where your crops are.
              </p>
            </div>
            <div className="relative mt-8 grid grid-cols-10 gap-1 opacity-30">
              {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className="h-1.5 rounded-full" style={{ background: i % 7 === 0 ? '#86EFAC' : i % 4 === 0 ? '#4ADE80' : 'rgba(255,255,255,0.2)' }} />
              ))}
            </div>
          </div>

          {/* Fastest harvest */}
          <div className="card-flat p-10 flex flex-col justify-between" style={{ background: '#0A0A0A' }}>
            <div className="label" style={{ color: 'rgba(255,255,255,0.3)' }}>Fastest Harvest</div>
            <div>
              <div className="heading-display text-7xl" style={{ color: 'white', fontWeight: 800 }}>27</div>
              <div className="text-2xl font-medium" style={{ color: 'rgba(255,255,255,0.4)', marginTop: -8 }}>days</div>
            </div>
          </div>

          {/* AI feature */}
          <div className="card-flat p-10 flex flex-col gap-4">
            <div className="label" style={{ color: '#1A3A2A' }}>Proprietary AI</div>
            <h3 className="text-xl font-bold" style={{ color: '#0A0A0A', letterSpacing: '-0.02em' }}>
              Smart Plant Relocation
            </h3>
            <p style={{ color: '#5A5A5A', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Our robotic gantry system moves plants to peak-yield modules overnight. No downtime, no waste.
            </p>
          </div>

          {/* Precision */}
          <div className="card-flat p-10 flex flex-col justify-between" style={{ background: '#F3F2EE' }}>
            <div className="label" style={{ color: 'rgba(10,10,10,0.4)' }}>Precision</div>
            <div>
              <div className="heading-display text-6xl" style={{ color: '#0A0A0A', fontWeight: 800 }}>1 kg</div>
              <div className="text-sm mt-2" style={{ color: '#8A8A8A' }}>Minimum order size. No waste.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="max-w-[1360px] mx-auto px-8 pb-24">
        <div className="card-flat p-16 lg:p-20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8"
             style={{ background: '#0A0A0A' }}>
          <div>
            <div className="label mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Ready?</div>
            <h2 className="heading-display text-4xl lg:text-5xl text-white" style={{ maxWidth: 500 }}>
              Start your first order today.
            </h2>
          </div>
          <div className="shrink-0">
            <Link href="/register" 
                  className="inline-flex items-center gap-2 font-semibold text-sm px-8 py-4 rounded-lg transition-all"
                  style={{ background: '#1A3A2A', color: 'white' }}>
              Begin Cultivation
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ borderTop: '1px solid rgba(10,10,10,0.06)' }} className="py-8">
        <div className="max-w-[1360px] mx-auto px-8 flex items-center justify-between">
          <Image src="/logo.png" alt="CAV" width={80} height={50} className="object-contain opacity-50" />
          <div className="flex items-center gap-6 text-xs" style={{ color: 'rgba(10,10,10,0.35)' }}>
            <span>Cultura Ad Verticem</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
