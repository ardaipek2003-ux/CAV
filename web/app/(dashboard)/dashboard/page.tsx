'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

interface Order {
  id: string;
  cropType: string;
  quantityKg: number;
  status: string;
  quotedHarvest: string | null;
  actualHarvest: string | null;
}

export default function DashboardHome() {
  const { data: session } = useSession();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    refetchInterval: 60_000,
  });

  const activeOrders = orders?.filter(o => o.status === 'GROWING' || o.status === 'CONFIRMED' || o.status === 'PENDING') || [];
  
  const upcomingHarvests = activeOrders
    .map(o => o.actualHarvest || o.quotedHarvest)
    .filter((d): d is string => d !== null)
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());
    
  const nextHarvest = upcomingHarvests.length > 0 ? upcomingHarvests[0] : null;

  return (
    <div className="fade-in space-y-8">
      {/* Welcome Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-white/[0.05] bg-gradient-to-br from-[#111827] to-[#0C0F17] p-10 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] via-transparent to-violet-500/[0.03]" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-80 h-80 bg-emerald-500/[0.06] rounded-full blur-[120px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.02em] mb-2">
              Welcome back, <span className="text-gradient capitalize">{session?.user?.name || 'Farmer'}</span>
            </h1>
            <p className="text-slate-500 text-base">
              Here is what is happening across your crops today.
            </p>
          </div>
          <Link href="/dashboard/order/new" className="btn-primary shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
            New Order
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bento-card p-7">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/[0.1] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/></svg>
            </div>
            <div className="text-slate-500 text-sm font-medium">Active Orders</div>
          </div>
          <div className="text-4xl font-bold text-gradient tracking-tight">
            {isLoading ? '–' : activeOrders.length}
          </div>
        </div>
        
        <div className="bento-card p-7">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/[0.1] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div className="text-slate-500 text-sm font-medium">Next Harvest</div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {isLoading ? '–' : (nextHarvest ? nextHarvest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No active crops')}
          </div>
        </div>

        <Link href="/dashboard/map" className="bento-card p-7 group hover:border-violet-500/20 transition-all flex flex-col justify-center relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/[0.08] border border-violet-500/[0.1] flex items-center justify-center group-hover:bg-violet-500/[0.12] transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            </div>
            <div className="text-violet-400 text-sm font-medium">Facility Map</div>
          </div>
          <h3 className="text-base font-semibold mb-1 text-slate-300">Track plants in real-time</h3>
          <span className="text-sm text-slate-500 group-hover:text-violet-400 transition-colors flex items-center gap-1">
            View map
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-0.5 transition-transform"><path d="m9 18 6-6-6-6"/></svg>
          </span>
        </Link>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Link href="/dashboard/orders" className="bento-card p-7 group hover:border-emerald-500/15 transition-all flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold mb-1 text-slate-200 group-hover:text-emerald-400 transition-colors">Manage Orders</h3>
            <p className="text-slate-500 text-sm">View details, confirm quotes, and track status</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:bg-emerald-500/[0.08] group-hover:border-emerald-500/[0.1] group-hover:text-emerald-400 transition-all text-slate-500">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </div>
        </Link>
        
        {session?.user?.role === 'ADMIN' && (
          <Link href="/admin" className="bento-card p-7 group hover:border-violet-500/15 transition-all flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold mb-1 text-slate-200 group-hover:text-violet-400 transition-colors">Admin Panel</h3>
              <p className="text-slate-500 text-sm">Facility oversight and optimizer tools</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:bg-violet-500/[0.08] group-hover:border-violet-500/[0.1] group-hover:text-violet-400 transition-all text-slate-500">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
