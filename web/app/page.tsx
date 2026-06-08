import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen text-white overflow-hidden">

      {/* ─── Ambient Background ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-emerald-500/[0.04] blur-[180px] animate-orb-1" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-500/[0.05] blur-[180px] animate-orb-2" />
        <div className="absolute top-[40%] left-[55%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.03] blur-[140px] animate-orb-3" />
      </div>

      {/* ─── Navigation ─── */}
      <nav className="relative z-50 flex items-center justify-between px-8 lg:px-16 py-5 max-w-[1400px] mx-auto">
        <Link href="/" className="flex items-center group">
          <div className="transition-all duration-500 rounded-xl">
            <Image src="/logo.png" alt="CAV Farming Technologies" width={140} height={88} className="object-contain" />
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/[0.04]">
            Sign In
          </Link>
          <Link href="/register" className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-400 to-emerald-500 text-[#0C0F17] rounded-lg hover:from-emerald-300 hover:to-emerald-400 transition-all duration-300 shadow-[0_2px_16px_rgba(52,211,153,0.25)]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-8 lg:px-16 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-20 items-center min-h-[65vh]">
          
          {/* Left */}
          <div className="fade-up">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.05] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-emerald-400 text-xs font-medium tracking-wide">AI-Powered Vertical Farming</span>
            </div>

            <h1 className="text-[clamp(2.75rem,5.5vw,5rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-8">
              <span className="block text-slate-100">Cultivation</span>
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400">Towards</span>
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-violet-300">the Peak.</span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-lg mb-10 font-light">
              Architecting the future of agriculture. Our AI-orchestrated vertical farm grows 
              precision crops across <span className="text-slate-200 font-normal">10,000 modules</span>, delivering 
              at peak perfection.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-14">
              <Link href="/register" className="group relative px-8 py-4 text-sm font-semibold bg-gradient-to-r from-emerald-400 to-emerald-500 text-[#0C0F17] rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-[0_4px_24px_rgba(52,211,153,0.25)]">
                <span className="relative z-10">Begin Cultivation</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-300 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link href="/login" className="group flex items-center gap-2 px-8 py-4 text-sm font-medium text-slate-300 rounded-xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.03] transition-all duration-300">
                <span>Enter Dashboard</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-8 border-t border-white/[0.05]">
              <div>
                <div className="text-2xl font-bold text-slate-100 tracking-tight">450K</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-widest mt-0.5 font-medium">Plant Spots</div>
              </div>
              <div className="w-px h-8 bg-white/[0.06]" />
              <div>
                <div className="text-2xl font-bold text-slate-100 tracking-tight">10K</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-widest mt-0.5 font-medium">Modules</div>
              </div>
              <div className="w-px h-8 bg-white/[0.06]" />
              <div>
                <div className="text-2xl font-bold text-emerald-400 tracking-tight">27d</div>
                <div className="text-[11px] text-slate-500 uppercase tracking-widest mt-0.5 font-medium">Min Harvest</div>
              </div>
            </div>
          </div>

          {/* Right: Hero Image */}
          <div className="relative fade-up hidden lg:block" style={{animationDelay: '0.15s'}}>
            <div className="absolute -inset-10 bg-gradient-to-br from-emerald-500/10 via-transparent to-violet-500/10 rounded-[48px] blur-3xl opacity-50 animate-orb-3" />
            <div className="relative rounded-[28px] overflow-hidden border border-white/[0.06] shadow-2xl shadow-black/40">
              <Image 
                src="/hero-bg.png" 
                alt="CAV Vertical Farm — Precision Growing Modules" 
                width={800} 
                height={600} 
                className="object-cover w-full h-[500px]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0F17] via-transparent to-transparent opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0C0F17]/20" />
              
              {/* Floating Card */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/30 backdrop-blur-2xl border border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200">Growth Cycle Active</div>
                      <div className="text-xs text-slate-500">Module #7,841 — Lettuce Batch</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-semibold text-emerald-400 tracking-wider">LIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <div className="relative z-10 border-y border-white/[0.03] py-5 overflow-hidden">
        <div className="marquee-track flex items-center gap-16 whitespace-nowrap text-sm font-medium text-slate-600 tracking-wide">
          <span>AI-OPTIMIZED GROWTH</span>
          <span className="text-emerald-500/20">◆</span>
          <span>PRECISION LETTUCE</span>
          <span className="text-emerald-500/20">◆</span>
          <span>HYDROPONIC TOMATOES</span>
          <span className="text-emerald-500/20">◆</span>
          <span>AUTONOMOUS RELOCATION</span>
          <span className="text-emerald-500/20">◆</span>
          <span>REAL-TIME TRACKING</span>
          <span className="text-emerald-500/20">◆</span>
          <span>27-DAY HARVEST CYCLE</span>
          <span className="text-emerald-500/20">◆</span>
          <span>AI-OPTIMIZED GROWTH</span>
          <span className="text-emerald-500/20">◆</span>
          <span>PRECISION LETTUCE</span>
          <span className="text-emerald-500/20">◆</span>
          <span>HYDROPONIC TOMATOES</span>
          <span className="text-emerald-500/20">◆</span>
          <span>AUTONOMOUS RELOCATION</span>
          <span className="text-emerald-500/20">◆</span>
          <span>REAL-TIME TRACKING</span>
          <span className="text-emerald-500/20">◆</span>
          <span>27-DAY HARVEST CYCLE</span>
        </div>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-8 lg:px-16 py-32">
        <div className="text-center mb-20 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-slate-500 text-xs font-medium uppercase tracking-[0.15em] mb-6">
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em]">
            From Seed to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Delivery</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-0 stagger">
          {/* Step 1 */}
          <div className="relative p-10 group">
            <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent hidden md:block" />
            <div className="text-[72px] font-black text-white/[0.02] leading-none absolute top-4 right-6 select-none">01</div>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/[0.12] flex items-center justify-center mb-6 group-hover:bg-emerald-500/[0.12] group-hover:shadow-[0_0_24px_rgba(52,211,153,0.08)] transition-all duration-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-slate-200">Define Your Yield</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Specify the exact kilograms of lettuce or tomatoes you need. Our algorithm allocates optimal grow spots instantly.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-10 group">
            <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent hidden md:block" />
            <div className="text-[72px] font-black text-white/[0.02] leading-none absolute top-4 right-6 select-none">02</div>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-violet-500/[0.08] border border-violet-500/[0.12] flex items-center justify-center mb-6 group-hover:bg-violet-500/[0.12] group-hover:shadow-[0_0_24px_rgba(139,92,246,0.08)] transition-all duration-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m6.8 15-3.5 2"/><path d="m20.7 7-3.5 2"/><path d="M6.8 9 3.3 7"/><path d="m20.7 17-3.5-2"/><path d="m9 22 3-8 3 8"/><path d="M8 22h8"/><circle cx="12" cy="12" r="2"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-slate-200">AI Cultivates</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Robotic arms relocate your plants overnight to the highest-yield modules, accelerating growth by up to 30%.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-10 group">
            <div className="text-[72px] font-black text-white/[0.02] leading-none absolute top-4 right-6 select-none">03</div>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-amber-500/[0.08] border border-amber-500/[0.12] flex items-center justify-center mb-6 group-hover:bg-amber-500/[0.12] group-hover:shadow-[0_0_24px_rgba(245,158,11,0.08)] transition-all duration-500">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-slate-200">Harvest & Deliver</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Track your order in real-time on the facility map. When ready, your perfectly grown produce is harvested and delivered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE BENTO GRID ─── */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-8 lg:px-16 pb-32">
        <div className="grid md:grid-cols-12 gap-4 stagger">
          
          {/* Live Facility Map */}
          <div className="md:col-span-7 group relative rounded-2xl overflow-hidden border border-white/[0.05] bg-gradient-to-br from-[#111827] to-[#0C0F17] p-10 min-h-[360px] flex flex-col justify-end hover:border-emerald-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.02)_1px,transparent_1px)] bg-[size:28px_28px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-8 right-8 w-40 h-40 bg-emerald-500/[0.04] rounded-full blur-[80px] group-hover:bg-emerald-500/[0.08] transition-all duration-700" />
            
            <div className="absolute top-10 right-10 grid grid-cols-8 gap-1.5 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
              {Array.from({length: 48}).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i % 7 === 0 ? 'bg-emerald-400' : i % 11 === 0 ? 'bg-amber-400' : 'bg-white/15'}`} />
              ))}
            </div>
            
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/[0.06] border border-emerald-500/[0.1] text-emerald-400 text-[10px] font-semibold uppercase tracking-wider mb-4">
                Interactive
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-200">Live Facility Map</h3>
              <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                Watch your plants growing across our entire 10,000-module facility in real-time. Zoom into any module, track growth progress, and see exactly where your crops are.
              </p>
            </div>
          </div>

          {/* Stat: 450K */}
          <div className="md:col-span-5 group relative rounded-2xl overflow-hidden border border-white/[0.05] bg-gradient-to-br from-[#111827] to-[#0C0F17] p-10 flex flex-col justify-center items-center text-center hover:border-violet-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="text-6xl md:text-7xl font-black tracking-tight text-gradient leading-none">450K</div>
              <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">Active Plant Spots</div>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-emerald-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
                <span className="font-medium">12% growth this quarter</span>
              </div>
            </div>
          </div>

          {/* AI Optimization */}
          <div className="md:col-span-5 group relative rounded-2xl overflow-hidden border border-white/[0.05] bg-gradient-to-br from-[#111827] to-[#0C0F17] p-10 min-h-[260px] flex flex-col justify-end hover:border-violet-500/20 transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-8 left-8 w-28 h-28 bg-violet-500/[0.05] rounded-full blur-[60px] group-hover:bg-violet-500/[0.1] transition-all duration-700" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/[0.06] border border-violet-500/[0.1] text-violet-400 text-[10px] font-semibold uppercase tracking-wider mb-4">
                Proprietary AI
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-200">Smart Relocation</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Our robotic gantry system autonomously relocates plants to optimal modules overnight, accelerating your delivery.
              </p>
            </div>
          </div>

          {/* Speed */}
          <div className="md:col-span-3 group relative rounded-2xl overflow-hidden border border-white/[0.05] bg-gradient-to-br from-[#111827] to-[#0C0F17] p-8 flex flex-col justify-center items-center text-center hover:border-emerald-500/20 transition-all duration-500">
            <div className="relative">
              <div className="text-5xl font-black text-gradient-primary leading-none">27</div>
              <div className="mt-1 text-2xl font-semibold text-slate-400">days</div>
              <div className="mt-3 text-[10px] uppercase tracking-[0.2em] text-slate-500 font-medium">Fastest Harvest</div>
            </div>
          </div>

          {/* Order Precision */}
          <div className="md:col-span-4 group relative rounded-2xl overflow-hidden border border-white/[0.05] bg-gradient-to-br from-[#111827] to-[#0C0F17] p-8 flex flex-col justify-center items-center text-center hover:border-amber-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col items-center">
              <div className="w-14 h-14 rounded-xl bg-amber-500/[0.08] border border-amber-500/[0.12] flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="text-base font-semibold mb-2 text-slate-200">Order by Kilogram</h3>
              <p className="text-slate-500 text-sm">Exact precision. Zero waste.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-8 lg:px-16 pb-32">
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.05] bg-gradient-to-br from-[#111827] to-[#0C0F17] p-16 md:p-20 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] via-transparent to-violet-500/[0.04]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/[0.05] rounded-full blur-[120px]" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold tracking-[-0.03em] mb-6">
              Ready to grow <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-violet-400">smarter</span>?
            </h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto mb-10 font-light">
              Join CAV Farming Technologies and experience the future of precision agriculture.
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 px-10 py-4 text-sm font-semibold bg-gradient-to-r from-emerald-400 to-emerald-500 text-[#0C0F17] rounded-xl hover:from-emerald-300 hover:to-emerald-400 transition-all duration-300 shadow-[0_4px_24px_rgba(52,211,153,0.25)] hover:shadow-[0_8px_40px_rgba(52,211,153,0.35)] hover:scale-[1.02]">
              Start Your First Order
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/[0.03] py-10 px-8 lg:px-16">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="CAV" width={90} height={56} className="object-contain opacity-60" />
          </div>
          <div className="flex items-center gap-8 text-sm text-slate-600">
            <span>Cultura Ad Verticem</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
