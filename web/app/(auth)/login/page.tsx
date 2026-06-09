'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Invalid email or password.');
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
           style={{ background: '#0A0A0A' }}>
        
        {/* Dot grid texture */}
        <div className="absolute inset-0 dot-grid opacity-[0.12]" />

        {/* Large decorative number */}
        <div className="absolute bottom-[-20px] right-[-20px] leading-none font-black select-none"
             style={{ fontSize: 280, color: 'rgba(255,255,255,0.03)', fontFamily: 'var(--font-outfit)', letterSpacing: '-0.05em', lineHeight: 1 }}>
          CAV
        </div>
        
        <div className="relative z-10">
          <Link href="/">
            <Image src="/logo.png" alt="CAV" width={110} height={70} className="object-contain brightness-0 invert" />
          </Link>
        </div>

        <div className="relative z-10">
          <div className="h-px w-10 mb-8" style={{ background: '#1A3A2A' }} />
          <h2 className="heading-display text-white mb-4" style={{ fontSize: '2.25rem', lineHeight: 1.1 }}>
            Cultivation<br/>
            <span style={{ color: '#4ADE80' }}>towards</span><br/>
            the peak.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9375rem', lineHeight: 1.6, maxWidth: 300 }}>
            AI-orchestrated vertical farming across 10,000 modules.
          </p>
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
              <Image src="/logo.png" alt="CAV" width={120} height={76} className="object-contain" />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#0A0A0A', letterSpacing: '-0.03em' }}>
              Welcome back
            </h1>
            <p style={{ color: '#8A8A8A', fontSize: '0.875rem' }}>
              Sign in to your account to continue
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
                className="input-field" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: '#8A8A8A' }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold" style={{ color: '#1A3A2A' }}>
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
