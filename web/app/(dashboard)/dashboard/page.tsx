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
  
  // Find the earliest upcoming harvest
  const upcomingHarvests = activeOrders
    .map(o => o.actualHarvest || o.quotedHarvest)
    .filter((d): d is string => d !== null)
    .map(d => new Date(d))
    .sort((a, b) => a.getTime() - b.getTime());
    
  const nextHarvest = upcomingHarvests.length > 0 ? upcomingHarvests[0] : null;

  return (
    <div className="fade-in space-y-8">
      {/* Welcome Hero */}
      <div className="relative rounded-[32px] overflow-hidden border border-white/[0.06] bg-gradient-to-br from-[#0d1117] to-[#0a0e16] p-10 md:p-14">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E59B]/[0.05] via-transparent to-[#6E56CF]/[0.05]" />
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#00E59B]/[0.08] rounded-full blur-[100px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 capitalize">{session?.user?.name || 'Farmer'}</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Here is what is happening across your crops today.
            </p>
          </div>
          <Link href="/dashboard/order/new" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-[#00E59B] text-[#060910] rounded-xl hover:bg-[#00ffaa] transition-all duration-300 shadow-[0_4px_24px_rgba(0,229,155,0.2)] hover:shadow-[0_8px_32px_rgba(0,229,155,0.3)] hover:scale-[1.02] shrink-0">
            + New Order
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bento-card p-8 flex flex-col justify-center">
          <div className="text-gray-400 text-sm mb-2 font-medium">Active Orders</div>
          <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
            {isLoading ? '-' : activeOrders.length}
          </div>
        </div>
        
        <div className="bento-card p-8 flex flex-col justify-center">
          <div className="text-gray-400 text-sm mb-2 font-medium">Next Expected Harvest</div>
          <div className="text-3xl font-bold text-[#00E59B]">
            {isLoading ? '-' : (nextHarvest ? nextHarvest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No active crops')}
          </div>
        </div>

        <div className="bento-card p-8 bg-gradient-to-br from-blue-900/20 to-transparent flex flex-col justify-center relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute -right-6 -bottom-6 text-8xl opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500">🗺️</div>
          <div className="text-blue-400 text-sm mb-2 font-medium">Facility Live Map</div>
          <h3 className="text-xl font-bold mb-4">Track your plants in real-time</h3>
          <Link href="/dashboard/map" className="text-sm font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 w-fit">
            View Live Map →
          </Link>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/orders" className="bento-card p-8 group hover:border-[#00E59B]/30 transition-all flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1 group-hover:text-[#00E59B] transition-colors">Manage Orders</h3>
            <p className="text-gray-400 text-sm">View details, confirm quotes, and track status</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-[#00E59B]/10 group-hover:text-[#00E59B] transition-all">
            →
          </div>
        </Link>
        
        {session?.user?.role === 'ADMIN' && (
          <Link href="/admin" className="bento-card p-8 group hover:border-purple-500/30 transition-all flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-purple-400 transition-colors">Admin Panel</h3>
              <p className="text-gray-400 text-sm">Facility oversight and optimizer tools</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-purple-500/10 group-hover:text-purple-400 transition-all">
              →
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
