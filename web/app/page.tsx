import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect('/dashboard/orders');
  }

  return (
    <div className="min-h-screen bg-[#060910] text-white overflow-hidden">

      {/* ─── Animated Background Grid + Orbs ─── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,155,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,155,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#00E59B]/[0.07] blur-[150px] animate-orb-1" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#6E56CF]/[0.08] blur-[150px] animate-orb-2" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-[#00E59B]/[0.04] blur-[120px] animate-orb-3" />
      </div>

      {/* ─── Navigation ─── */}
      <nav className="relative z-50 flex items-center justify-between px-8 lg:px-16 py-6 max-w-[1440px] mx-auto">
        <Link href="/" className="flex items-center group">
          <div className="shadow-[0_0_24px_rgba(0,229,155,0.2)] group-hover:shadow-[0_0_36px_rgba(0,229,155,0.4)] transition-shadow duration-500 rounded-xl">
            <Image src="/logo.png" alt="CAV Farming Technologies" width={160} height={100} className="object-contain" />
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
            Sign In
          </Link>
          <Link href="/register" className="px-6 py-2.5 text-sm font-semibold bg-[#00E59B] text-[#060910] rounded-full hover:bg-[#00ffaa] transition-all duration-300 shadow-[0_0_20px_rgba(0,229,155,0.3)] hover:shadow-[0_0_30px_rgba(0,229,155,0.5)] hover:scale-105">
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative z-10 max-w-[1440px] mx-auto px-8 lg:px-16 pt-16 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
          
          {/* Left: Text Content */}
          <div className="fade-up">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[#00E59B]/20 bg-[#00E59B]/[0.06] backdrop-blur-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E59B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E59B]"></span>
              </span>
              <span className="text-[#00E59B] text-xs font-semibold uppercase tracking-[0.15em]">AI-Powered Farming Technologies</span>
            </div>

            <h1 className="text-[clamp(3rem,6vw,5.5rem)] font-bold leading-[0.95] tracking-tight mb-8">
              <span className="block text-white">Cultivation</span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#00E59B] via-[#00D4AA] to-[#6E56CF]">Towards</span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#6E56CF] to-[#9E8CFC]">the Peak.</span>
            </h1>

            <p className="text-lg text-gray-400 leading-relaxed max-w-lg mb-10">
              Architecting the future of agriculture. Our AI-orchestrated vertical farm grows 
              precision crops across <span className="text-white font-medium">10,000 modules</span>, delivering 
              at peak perfection.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-14">
              <Link href="/register" className="group relative px-8 py-4 text-base font-semibold bg-[#00E59B] text-[#060910] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-[0_8px_32px_rgba(0,229,155,0.3)]">
                <span className="relative z-10">Begin Cultivation</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ffaa] to-[#00E59B] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link href="/login" className="group flex items-center gap-2 px-8 py-4 text-base font-medium text-gray-300 rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all duration-300">
                <span>Enter Dashboard</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            </div>

            {/* Micro Stats Row */}
            <div className="flex items-center gap-8 pt-8 border-t border-white/[0.06]">
              <div>
                <div className="text-2xl font-bold text-white">450K</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">Plant Spots</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-white">10K</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">Modules</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-2xl font-bold text-[#00E59B]">27d</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-0.5">Min Harvest</div>
              </div>
            </div>
          </div>

          {/* Right: Cinematic Image with Glow */}
          <div className="relative fade-up hidden lg:block" style={{animationDelay: '0.2s'}}>
            <div className="absolute -inset-8 bg-gradient-to-br from-[#00E59B]/20 via-transparent to-[#6E56CF]/20 rounded-[40px] blur-3xl opacity-60 animate-orb-3" />
            <div className="relative rounded-[32px] overflow-hidden border border-white/[0.08] shadow-2xl shadow-black/50">
              <Image 
                src="/hero-bg.png" 
                alt="CAV Vertical Farm — Precision Growing Modules" 
                width={800} 
                height={600} 
                className="object-cover w-full h-[520px]"
                priority
              />
              {/* Overlay gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#060910] via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#060910]/30" />
              
              {/* Floating Data Card overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00E59B]/20 flex items-center justify-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00E59B" strokeWidth="2"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Growth Cycle Active</div>
                      <div className="text-xs text-gray-400">Module #7,841 — Lettuce Batch</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#00E59B] animate-pulse" />
                    <span className="text-xs font-medium text-[#00E59B]">LIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MARQUEE STRIP ─── */}
      <div className="relative z-10 border-y border-white/[0.04] py-5 overflow-hidden bg-[#060910]/80 backdrop-blur-sm">
        <div className="marquee-track flex items-center gap-12 whitespace-nowrap text-sm font-medium text-gray-500">
          <span>🌱 AI-OPTIMIZED GROWTH</span>
          <span className="text-[#00E59B]/30">◆</span>
          <span>🥬 PRECISION LETTUCE</span>
          <span className="text-[#00E59B]/30">◆</span>
          <span>🍅 HYDROPONIC TOMATOES</span>
          <span className="text-[#00E59B]/30">◆</span>
          <span>🤖 AUTONOMOUS RELOCATION</span>
          <span className="text-[#00E59B]/30">◆</span>
          <span>📊 REAL-TIME TRACKING</span>
          <span className="text-[#00E59B]/30">◆</span>
          <span>⚡ 27-DAY HARVEST CYCLE</span>
          <span className="text-[#00E59B]/30">◆</span>
          <span>🌱 AI-OPTIMIZED GROWTH</span>
          <span className="text-[#00E59B]/30">◆</span>
          <span>🥬 PRECISION LETTUCE</span>
          <span className="text-[#00E59B]/30">◆</span>
          <span>🍅 HYDROPONIC TOMATOES</span>
          <span className="text-[#00E59B]/30">◆</span>
          <span>🤖 AUTONOMOUS RELOCATION</span>
          <span className="text-[#00E59B]/30">◆</span>
          <span>📊 REAL-TIME TRACKING</span>
          <span className="text-[#00E59B]/30">◆</span>
          <span>⚡ 27-DAY HARVEST CYCLE</span>
        </div>
      </div>

      {/* ─── HOW IT WORKS — PROCESS STEPS ─── */}
      <section className="relative z-10 max-w-[1440px] mx-auto px-8 lg:px-16 py-32">
        <div className="text-center mb-20 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-gray-400 text-xs font-semibold uppercase tracking-[0.15em] mb-6">
            How It Works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            From Seed to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E59B] to-[#00D4AA]">Delivery</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-0 stagger">
          {/* Step 1 */}
          <div className="relative p-10 group">
            <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
            <div className="text-[80px] font-black text-white/[0.03] leading-none absolute top-4 right-6">01</div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E59B]/20 to-[#00E59B]/5 border border-[#00E59B]/20 flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_rgba(0,229,155,0.15)] transition-all duration-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E59B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 13L2 9z"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Define Your Yield</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Specify the exact kilograms of lettuce or tomatoes you need. Our algorithm allocates optimal grow spots instantly.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative p-10 group">
            <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
            <div className="text-[80px] font-black text-white/[0.03] leading-none absolute top-4 right-6">02</div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6E56CF]/20 to-[#6E56CF]/5 border border-[#6E56CF]/20 flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_rgba(110,86,207,0.15)] transition-all duration-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6E56CF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="m6.8 15-3.5 2"/><path d="m20.7 7-3.5 2"/><path d="M6.8 9 3.3 7"/><path d="m20.7 17-3.5-2"/><path d="m9 22 3-8 3 8"/><path d="M8 22h8"/><circle cx="12" cy="12" r="2"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">AI Cultivates</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Robotic arms relocate your plants overnight to the highest-yield modules, accelerating growth by up to 30%.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative p-10 group">
            <div className="text-[80px] font-black text-white/[0.03] leading-none absolute top-4 right-6">03</div>
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFB224]/20 to-[#FFB224]/5 border border-[#FFB224]/20 flex items-center justify-center mb-6 group-hover:shadow-[0_0_30px_rgba(255,178,36,0.15)] transition-all duration-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFB224" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Harvest & Deliver</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Track your order in real-time on the facility map. When ready, your perfectly grown produce is harvested and delivered.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURE SHOWCASE — Bento Grid ─── */}
      <section className="relative z-10 max-w-[1440px] mx-auto px-8 lg:px-16 pb-32">
        <div className="grid md:grid-cols-12 gap-5 stagger">
          
          {/* Large Feature Card: Live Facility Map */}
          <div className="md:col-span-7 group relative rounded-[28px] overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0d1117] to-[#0a0e16] p-10 min-h-[380px] flex flex-col justify-end hover:border-[#00E59B]/30 transition-all duration-500">
            {/* Decorative grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,155,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,155,0.04)_1px,transparent_1px)] bg-[size:32px_32px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-8 right-8 w-48 h-48 bg-[#00E59B]/[0.06] rounded-full blur-[80px] group-hover:bg-[#00E59B]/[0.12] transition-all duration-700" />
            
            {/* Mock map dots */}
            <div className="absolute top-10 right-10 grid grid-cols-8 gap-1.5 opacity-30 group-hover:opacity-60 transition-opacity duration-700">
              {Array.from({length: 48}).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i % 7 === 0 ? 'bg-[#00E59B]' : i % 11 === 0 ? 'bg-[#FFB224]' : 'bg-white/20'}`} />
              ))}
            </div>
            
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E59B]/10 border border-[#00E59B]/20 text-[#00E59B] text-[11px] font-semibold uppercase tracking-wider mb-4">
                Interactive
              </div>
              <h3 className="text-2xl font-bold mb-3">Live Facility Map</h3>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Watch your plants growing across our entire 10,000-module facility in real-time. Zoom into any module, track growth progress, and see exactly where your crops are.
              </p>
            </div>
          </div>

          {/* Stat Card: Plant Spots */}
          <div className="md:col-span-5 group relative rounded-[28px] overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0d1117] to-[#0a0e16] p-10 flex flex-col justify-center items-center text-center hover:border-[#6E56CF]/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6E56CF]/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <div className="text-7xl md:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 leading-none">450K</div>
              <div className="mt-3 text-sm uppercase tracking-[0.2em] text-gray-500 font-semibold">Active Plant Spots</div>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#00E59B]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
                <span className="font-medium">12% growth this quarter</span>
              </div>
            </div>
          </div>

          {/* Card: AI Optimization */}
          <div className="md:col-span-5 group relative rounded-[28px] overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0d1117] to-[#0a0e16] p-10 min-h-[280px] flex flex-col justify-end hover:border-[#6E56CF]/30 transition-all duration-500">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6E56CF]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-8 left-8 w-32 h-32 bg-[#6E56CF]/[0.08] rounded-full blur-[60px] group-hover:bg-[#6E56CF]/[0.15] transition-all duration-700" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6E56CF]/10 border border-[#6E56CF]/20 text-[#9E8CFC] text-[11px] font-semibold uppercase tracking-wider mb-4">
                Proprietary AI
              </div>
              <h3 className="text-2xl font-bold mb-3">Smart Relocation</h3>
              <p className="text-gray-400 leading-relaxed">
                Our robotic gantry system autonomously relocates plants to optimal modules overnight, accelerating your delivery.
              </p>
            </div>
          </div>

          {/* Card: Speed */}
          <div className="md:col-span-3 group relative rounded-[28px] overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0d1117] to-[#0a0e16] p-8 flex flex-col justify-center items-center text-center hover:border-[#00E59B]/30 transition-all duration-500">
            <div className="relative">
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#00E59B] to-[#008A5E] leading-none">27</div>
              <div className="mt-1 text-3xl font-bold text-gray-300">days</div>
              <div className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500 font-semibold">Fastest Harvest</div>
            </div>
          </div>

          {/* Card: Order Precision */}
          <div className="md:col-span-4 group relative rounded-[28px] overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0d1117] to-[#0a0e16] p-8 flex flex-col justify-center items-center text-center hover:border-[#FFB224]/30 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFB224]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FFB224]/10 border border-[#FFB224]/20 flex items-center justify-center mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFB224" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Order by Kilogram</h3>
              <p className="text-gray-400 text-sm">Exact precision. Zero waste.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="relative z-10 max-w-[1440px] mx-auto px-8 lg:px-16 pb-32">
        <div className="relative rounded-[32px] overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0d1117] to-[#0a0e16] p-16 md:p-20 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E59B]/[0.05] via-transparent to-[#6E56CF]/[0.05]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00E59B]/[0.06] rounded-full blur-[120px]" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Ready to grow <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E59B] to-[#6E56CF]">smarter</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-lg mx-auto mb-10">
              Join CAV Farming Technologies and experience the future of precision agriculture.
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 px-10 py-4 text-base font-semibold bg-[#00E59B] text-[#060910] rounded-2xl hover:bg-[#00ffaa] transition-all duration-300 shadow-[0_8px_32px_rgba(0,229,155,0.3)] hover:shadow-[0_12px_48px_rgba(0,229,155,0.4)] hover:scale-[1.02]">
              Start Your First Order
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 border-t border-white/[0.04] py-10 px-8 lg:px-16">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="CAV" width={100} height={60} className="object-contain" />
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <span>Cultura Ad Verticem</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
