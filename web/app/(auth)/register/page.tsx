'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Registration failed'); setLoading(false); return; }
      const signInResult = await signIn('credentials', { email, password, redirect: false });
      if (signInResult?.error) {
        setError('Registered, but failed to sign in automatically.');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#FAFAF8' }}>

      {/* Left — decorative panel */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden flex-col justify-between p-12"
           style={{ background: '#1A3A2A' }}>
        
        {/* Hatch texture */}
        <div className="absolute inset-0 hatch-bg opacity-30" />
        
        {/* Large decorative number */}
        <div className="absolute bottom-[-10px] right-[-30px] leading-none font-black select-none"
             style={{ fontSize: 260, color: 'rgba(255,255,255,0.04)', fontFamily: 'var(--font-outfit)', letterSpacing: '-0.05em', lineHeight: 1 }}>
          10K
        </div>

        <div className="relative z-10">
          <Link href="/">
            <Image src="/logo.png" alt="CAV" width={132} height={84} className="object-contain" />
          </Link>
        </div>

        <div className="relative z-10">
          <div className="h-px w-10 mb-8" style={{ background: 'rgba(255,255,255,0.3)' }} />
          <h2 className="heading-display text-white mb-4" style={{ fontSize: '2.25rem', lineHeight: 1.1 }}>
            Grow with<br/>
            <span style={{ color: '#86EFAC' }}>precision.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: 300 }}>
            Join CAV and place your first order in minutes. Fresh produce, delivered at peak nutrition.
          </p>
          <div className="mt-8 flex items-center gap-4">
            {[{ n: '10K', l: 'Modules' }, { n: '27d', l: 'Harvest' }].map(({n,l}) => (
              <div key={l}>
                <div className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-outfit)', letterSpacing: '-0.03em' }}>{n}</div>
                <div className="text-xs uppercase tracking-wider font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
          © 2026 CAV Farming Technologies
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[380px] fade-in">
          
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 flex justify-center">
            <Link href="/">
              <Image src="/logo.png" alt="CAV" width={132} height={84} className="object-contain" style={{ filter: 'brightness(0)' }} />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#0A0A0A', letterSpacing: '-0.03em' }}>
              Create your account
            </h1>
            <p style={{ color: '#8A8A8A', fontSize: '0.875rem' }}>
              Start ordering fresh produce today
            </p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg text-sm" 
                 style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block mb-1.5 text-sm font-medium" style={{ color: '#2A2A2A' }}>
                Full name
              </label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="input-field" placeholder="Jane Doe" required />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1.5 text-sm font-medium" style={{ color: '#2A2A2A' }}>
                Email address
              </label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" placeholder="you@example.com" required />
            </div>
            <div>
              <label htmlFor="password" className="block mb-1.5 text-sm font-medium" style={{ color: '#2A2A2A' }}>
                Password
              </label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="At least 6 characters" minLength={6} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 mt-2 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ background: '#1A3A2A', color: 'white' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: '#8A8A8A' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: '#1A3A2A' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
