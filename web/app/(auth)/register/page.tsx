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

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError('Registered successfully, but failed to sign in automatically.');
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
    <div className="min-h-screen flex">
      {/* Left: Brand Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C0F17] via-[#111827] to-[#0C0F17]" />
        <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-violet-500/[0.06] rounded-full blur-[140px]" />
        <div className="absolute bottom-[30%] left-[10%] w-[300px] h-[300px] bg-emerald-500/[0.06] rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(52,211,153,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />
        
        <div className="relative z-10">
          <Link href="/">
            <Image src="/logo.png" alt="CAV" width={120} height={75} className="object-contain" />
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold tracking-[-0.02em] text-slate-100 mb-4 leading-tight">
            Start growing<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">with precision.</span>
          </h2>
          <p className="text-slate-500 leading-relaxed">
            Create your account and place your first order in minutes. Fresh produce, delivered at peak perfection.
          </p>
        </div>

        <div className="relative z-10 text-xs text-slate-600">
          © 2026 CAV Farming Technologies
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#0C0F17]">
        <div className="w-full max-w-sm fade-in">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center mb-10 lg:hidden">
            <Link href="/">
              <Image src="/logo.png" alt="CAV" width={140} height={88} className="object-contain" />
            </Link>
          </div>

          <h1 className="text-2xl font-bold tracking-[-0.02em] mb-2">Create your account</h1>
          <p className="text-slate-500 text-sm mb-8">
            Start ordering fresh produce today
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/[0.06] border border-red-500/[0.12] text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Jane Doe"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-400 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
